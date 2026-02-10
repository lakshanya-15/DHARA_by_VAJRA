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
    endDate: null,
    notes: '',
    status: booking.status,
    createdAt: booking.createdat?.toISOString?.() ?? booking.createdat,
    Asset: booking.Asset ? {
      id: booking.Asset.id,
      name: booking.Asset.name,
      type: booking.Asset.type,
      operatorName: booking.Asset.User?.name || 'Operator',
      location: booking.Asset.User?.village || '',
    } : null,
  };
}

async function createBooking({ farmerId, assetId, startDate, endDate, notes }) {
  const bookingDate = new Date(startDate);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      farmerid: farmerId,
      assetid: assetId,
      bookingdate: bookingDate,
      status: 'BOOKED',
    },
    include: {
      Asset: { include: { User: true } },
      User: true,
    }
  });

  // Notify operator
  if (booking.Asset?.ownerid) {
    const timeStr = new Date().toLocaleTimeString();
    await notificationService.createNotification({
      userId: booking.Asset.ownerid,
      message: `New booking for ${booking.Asset.name} from ${booking.User?.name || 'a farmer'} on ${startDate} at ${timeStr}`,
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

async function listByFarmer(farmerId) {
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
};
