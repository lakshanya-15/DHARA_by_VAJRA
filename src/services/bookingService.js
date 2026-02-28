const prisma = require('../config/prisma');
const notificationService = require('./notificationService');
const { updateUserScore, getDiscountMultiplier } = require('./scoringService');
const paymentService = require('./paymentService');

function toApiBooking(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    farmerId: booking.farmerid,
    farmerName: booking.User?.name || 'Farmer',
    farmerPhone: booking.User?.phone || '',
    farmerAddress: booking.User?.address || booking.User?.village || '',
    assetId: booking.assetid,
    startDate: booking.bookingdate?.toISOString?.()?.slice(0, 10) ?? booking.bookingdate,
    bookingTime: booking.bookingTime,
    endDate: null,
    notes: '',
    status: booking.status,
    isReviewed: !!booking.Review,
    isDisputed: !!booking.Dispute,
    disputeStatus: booking.Dispute?.status || null,
    createdAt: booking.createdat?.toISOString?.() ?? booking.createdat,
    Asset: booking.Asset ? {
      id: booking.Asset.id,
      name: booking.Asset.name,
      type: booking.Asset.type,
      hourlyRate: Number(booking.Asset.priceperday) || 0,
      operatorName: booking.Asset.User?.name || 'Operator',
      operatorId: booking.Asset.User?.id || booking.Asset.ownerid || '',
      operatorPhone: booking.Asset.User?.phone || '',
      operatorAddress: booking.Asset.User?.address || booking.Asset.User?.village || '',
      location: booking.Asset.User?.village || '',
      operatorSegment: booking.Asset.User?.segment || 'NEW',
    } : null,
  };
}

async function createBooking({ farmerId, assetId, startDate, bookingTime, endDate, notes }) {
  const bookingDate = new Date(startDate);
  bookingDate.setHours(0, 0, 0, 0);

  // 1. Collision Detection: Check if asset is already booked for this date and time
  const existing = await prisma.booking.findFirst({
    where: {
      assetid: assetId,
      bookingdate: bookingDate,
      bookingTime: bookingTime,
      status: { in: ['BOOKED', 'PENDING'] }
    }
  });

  if (existing) {
    const err = new Error('This asset is already reserved for the selected date and time.');
    err.status = 409;
    throw err;
  }

  // 2. Create booking
  const booking = await prisma.booking.create({
    data: {
      farmerid: farmerId,
      assetid: assetId,
      bookingdate: bookingDate,
      bookingTime: bookingTime,
      status: 'PENDING', // Start as pending until payment is "confirmed"
    },
    include: {
      Asset: { include: { User: true } },
      User: true,
    }
  });

  // 3. Create simulated Escrow Payment
  // Calculate dynamic price based on segments
  const farmerSegment = booking.User?.segment || 'NEW';
  let operatorSegment = 'NEW';
  if (booking.Asset?.User?.segment) {
    operatorSegment = booking.Asset.User.segment;
  }

  const discountMult = getDiscountMultiplier(farmerSegment);

  let operatorMarkup = 1.0;
  if (operatorSegment === 'PREMIUM') operatorMarkup = 1.15;
  if (operatorSegment === 'LOYAL') operatorMarkup = 1.05;

  const basePrice = Number(booking.Asset.priceperday) || 0;
  const standardPrice = Math.round(basePrice * operatorMarkup);
  const totalAmount = Math.round(standardPrice * discountMult);

  await paymentService.createEscrow(booking.id, farmerId, totalAmount);


  // Update status to BOOKED after simulated payment
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'BOOKED' }
  });

  // Notify operator
  if (booking.Asset?.ownerid) {
    const farmerName = booking.User?.name || 'a farmer';
    const farmerPhone = booking.User?.phone || 'No phone';
    const farmerAddress = booking.User?.address || booking.User?.village || 'No address';
    await notificationService.createNotification({
      userId: booking.Asset.ownerid,
      message: `Confirmed booking for ${booking.Asset.name} from ${farmerName} on ${startDate}. Contact: ${farmerPhone}, ${farmerAddress}. Payment is in Escrow.`,
      type: 'BOOKING',
    });
  }

  // Profiling: Update preferred categories for recommendation engine
  try {
    const userProfile = await prisma.user.findUnique({ where: { id: farmerId } });
    let categories = userProfile.preferredCategories || [];
    const currentCategory = booking.Asset?.category;
    if (currentCategory && Array.isArray(categories)) {
      if (!categories.includes(currentCategory)) {
        categories.unshift(currentCategory);
        await prisma.user.update({
          where: { id: farmerId },
          data: { preferredCategories: categories.slice(0, 5) }
        });
      }
    }
  } catch (e) { console.error('Pref update failed:', e); }

  return toApiBooking(booking);
}

async function findById(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      Asset: { include: { User: true } },
      User: true,
    }
  });
  return toApiBooking(booking);
}

async function refreshBookingStatuses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all BOOKED bookings that are in the past (before today)
  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: 'BOOKED',
      bookingdate: { lt: today }
    },
    include: {
      Asset: { select: { ownerid: true } }
    }
  });

  if (expiredBookings.length > 0) {
    // Update bookings to COMPLETED
    await prisma.booking.updateMany({
      where: { id: { in: expiredBookings.map(b => b.id) } },
      data: { status: 'COMPLETED' }
    });

    // Update farmer completedBookings and scores
    const farmerCounts = expiredBookings.reduce((acc, b) => {
      acc[b.farmerid] = (acc[b.farmerid] || 0) + 1;
      return acc;
    }, {});
    for (const [fId, count] of Object.entries(farmerCounts)) {
      await prisma.user.update({
        where: { id: fId },
        data: { completedBookings: { increment: count } }
      });
      await updateUserScore(fId);
    }

    // Update operator completedBookings and scores
    const operatorCounts = expiredBookings.reduce((acc, b) => {
      const oId = b.Asset?.ownerid;
      if (oId) acc[oId] = (acc[oId] || 0) + 1;
      return acc;
    }, {});
    for (const [oId, count] of Object.entries(operatorCounts)) {
      await prisma.user.update({
        where: { id: oId },
        data: { completedBookings: { increment: count } }
      });
      await updateUserScore(oId);
    }

    console.log(`Auto-completed ${expiredBookings.length} expired bookings and updated scores.`);
  }
}

async function listByFarmer(farmerId) {
  await refreshBookingStatuses();
  const bookings = await prisma.booking.findMany({
    where: { farmerid: farmerId },
    include: {
      Asset: { include: { User: true } },
      User: true,
      Review: true,
      Dispute: true,
    },
    orderBy: { bookingdate: 'desc' },
  });
  return bookings.map(toApiBooking);
}

async function listByOperator(operatorId, assetIds) {
  await refreshBookingStatuses();
  const bookings = await prisma.booking.findMany({
    where: { assetid: { in: assetIds } },
    include: {
      Asset: { include: { User: true } },
      User: true,
      Review: true,
      Dispute: true,
    },
    orderBy: { bookingdate: 'desc' },
  });
  return bookings.map(toApiBooking);
}

async function cancelBooking(id, farmerId) {
  const booking = await prisma.booking.findFirst({
    where: { id, farmerid: farmerId },
    include: { Asset: true }
  });

  if (!booking) {
    const err = new Error('Booking not found or not owned by you');
    err.status = 404;
    throw err;
  }

  if (booking.status === 'CANCELLED') {
    return { success: true, message: 'Already cancelled' };
  }

  if (booking.status !== 'BOOKED' && booking.status !== 'PENDING') {
    const err = new Error(`Cannot cancel booking with status ${booking.status}`);
    err.status = 400;
    throw err;
  }

  // Calculate time difference
  const bookingDateTime = new Date(booking.bookingdate);
  if (booking.bookingTime) {
    const [hours, minutes] = booking.bookingTime.split(':');
    bookingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  }

  const hoursDiff = (bookingDateTime - new Date()) / (1000 * 60 * 60);
  const isPenaltyFree = hoursDiff >= 24;

  // 1. Update booking status
  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });

  // 2. Ensure asset is marked as available (just in case it was locked by old logic)
  if (booking.Asset && !booking.Asset.availability) {
    await prisma.asset.update({
      where: { id: booking.assetid },
      data: { availability: true }
    });
  }

  // 3. Apply penalty if cancelled late
  if (!isPenaltyFree) {
    await prisma.user.update({
      where: { id: farmerId },
      data: { cancelledBookings: { increment: 1 } }
    });
    await updateUserScore(farmerId);
  }

  // 4. Refund farmer if funds are in escrow
  await paymentService.refundFarmer(id);

  // 5. Notify operator
  if (booking.Asset?.ownerid) {
    await notificationService.createNotification({
      userId: booking.Asset.ownerid,
      message: `Booking for ${booking.Asset.name} was cancelled by the farmer.`,
      type: 'BOOKING_CANCELLED',
    });
  }

  return { success: true, isPenaltyFree };
}

async function listAllForAdmin() {
  const bookings = await prisma.booking.findMany();
  return bookings.map(toApiBooking);
}

async function updateJobStatus(id, newStatus, userId, hoursUsed = null) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { Asset: true }
  });

  if (!booking) throw new Error('Booking not found');

  // Authorization check
  if (newStatus === 'ACCEPTED' || newStatus === 'IN_PROGRESS') {
    if (booking.Asset.ownerid !== userId) throw new Error('Unauthorized');
  }

  if (newStatus === 'COMPLETED') {
    // Either the farmer completes it, or the operator completes it
    if (booking.farmerid !== userId && booking.Asset.ownerid !== userId) throw new Error('Unauthorized');

    // Check for active dispute
    const activeDispute = await prisma.dispute.findFirst({
      where: { bookingId: id, status: { in: ['OPEN', 'INVESTIGATING'] } }
    });

    if (activeDispute) throw new Error('Payment locked due to active dispute.');

    // Release funds from escrow to operator
    await paymentService.releaseFunds(id);

    // If hours were logged, process the extra charge since escrow was only for 1 hour
    if (hoursUsed && Number(hoursUsed) > 1) {
      const payment = await prisma.payment.findFirst({ where: { bookingId: id } });
      if (payment) {
        const extraAmount = Number(payment.amount) * (Number(hoursUsed) - 1);

        // Deduct from farmer for extra hours
        await prisma.user.update({
          where: { id: booking.farmerid },
          data: { walletBalance: { decrement: extraAmount } }
        });
        await prisma.transaction.create({
          data: { userId: booking.farmerid, amount: -extraAmount, type: 'DEDUCTION', description: `Extra hours (${Number(hoursUsed) - 1}) for booking: ${booking.Asset.name}` }
        });

        // Credit operator for extra hours
        await prisma.user.update({
          where: { id: booking.Asset.ownerid },
          data: { walletBalance: { increment: extraAmount } }
        });
        await prisma.transaction.create({
          data: { userId: booking.Asset.ownerid, amount: extraAmount, type: 'EARNING', description: `Extra hours (${Number(hoursUsed) - 1}) for booking: ${booking.Asset.name}` }
        });
      }
    }

    // Update scores
    await prisma.user.update({ where: { id: booking.farmerid }, data: { completedBookings: { increment: 1 } } });
    await prisma.user.update({ where: { id: booking.Asset.ownerid }, data: { completedBookings: { increment: 1 } } });
    await updateUserScore(booking.farmerid);
    await updateUserScore(booking.Asset.ownerid);
  }

  const updateData = { status: newStatus };
  if (newStatus === 'COMPLETED' && hoursUsed) {
    updateData.hoursUsed = Number(hoursUsed);
    // Update the lifetime hours used on the machine
    await prisma.asset.update({
      where: { id: booking.assetid },
      data: { totalHoursUsed: { increment: Number(hoursUsed) } }
    });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: { Asset: { include: { User: true } }, User: true }
  });

  return toApiBooking(updated);
}

module.exports = {
  createBooking,
  findById,
  listByFarmer,
  listByOperator,
  listAllForAdmin,
  refreshBookingStatuses,
  cancelBooking,
  updateJobStatus
};
