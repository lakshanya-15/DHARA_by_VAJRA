const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

function toApiBooking(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    farmerId: booking.farmerid,
    farmerName: booking.User?.name || 'Farmer',
    assetId: booking.assetid,
    startDate: booking.bookingdate?.toISOString?.()?.slice(0, 10) ?? booking.bookingdate,
    bookingTime: booking.bookingTime,
    endDate: null,
    notes: '',
    status: booking.status,
    createdAt: booking.createdat?.toISOString?.() ?? booking.createdat,
    Asset: booking.Asset ? {
      id: booking.Asset.id,
      name: booking.Asset.name,
      type: booking.Asset.type,
      hourlyRate: Number(booking.Asset.priceperday) || 0,
      operatorName: booking.Asset.User?.name || 'Operator',
      location: booking.Asset.User?.village || '',
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
      status: 'BOOKED',
    },
    include: {
      Asset: { include: { User: true } },
      User: true,
    }
  });

  // 3. Mark asset as unavailable
  await prisma.asset.update({
    where: { id: assetId },
    data: { availability: false }
  });

  // Notify operator
  if (booking.Asset?.ownerid) {
    await notificationService.createNotification({
      userId: booking.Asset.ownerid,
      message: `New booking for ${booking.Asset.name} from ${booking.User?.name || 'a farmer'} on ${startDate} at ${bookingTime}`,
      type: 'BOOKING',
    });
  }

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
    select: { id: true, assetid: true }
  });

  if (expiredBookings.length > 0) {
    const assetIds = [...new Set(expiredBookings.map(b => b.assetid))];

    // Update bookings to COMPLETED
    await prisma.booking.updateMany({
      where: { id: { in: expiredBookings.map(b => b.id) } },
      data: { status: 'COMPLETED' }
    });

    // Reset asset availability
    await prisma.asset.updateMany({
      where: { id: { in: assetIds } },
      data: { availability: true }
    });

    console.log(`Auto-completed ${expiredBookings.length} expired bookings.`);
  }
}

async function listByFarmer(farmerId) {
  await refreshBookingStatuses();
  const bookings = await prisma.booking.findMany({
    where: { farmerid: farmerId },
    include: {
      Asset: { include: { User: true } },
      User: true,
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
    },
    orderBy: { bookingdate: 'desc' },
  });
  return bookings.map(toApiBooking);
}

async function listAllForAdmin() {
  const bookings = await prisma.booking.findMany();
  return bookings.map(toApiBooking);
}

module.exports = {
  createBooking,
  findById,
  listByFarmer,
  listByOperator,
  listAllForAdmin,
  refreshBookingStatuses,
};
