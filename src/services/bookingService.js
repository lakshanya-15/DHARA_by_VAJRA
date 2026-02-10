/**
 * Booking service - uses Prisma (same DB as dharaa).
 * DB has bookingdate (single date) and status enum; API uses startDate/endDate - we use startDate as bookingdate.
 */
const prisma = require('../config/prisma');

function toApiBooking(booking) {
  if (!booking) return null;
  return {
    id: booking.id,
    farmerId: booking.farmerid,
    assetId: booking.assetid,
    startDate: booking.bookingdate?.toISOString?.()?.slice(0, 10) ?? booking.bookingdate,
    endDate: null, // not in schema
    notes: '',
    status: booking.status,
    createdAt: booking.createdat?.toISOString?.() ?? booking.createdat,
    Asset: booking.Asset ? {
      id: booking.Asset.id,
      name: booking.Asset.name,
      type: booking.Asset.type,
      location: booking.User?.village || '', // Asset owner location might be needed, but simplified for now
    } : null,
  };
}

async function createBooking({ farmerId, assetId, startDate, endDate, notes }) {
  const bookingDate = new Date(startDate);
  const booking = await prisma.booking.create({
    data: {
      farmerid: farmerId,
      assetid: assetId,
      bookingdate: bookingDate,
      status: 'BOOKED',
    },
  });
  return toApiBooking(booking);
}

async function findById(id) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  return toApiBooking(booking);
}

async function listByFarmer(farmerId) {
  const bookings = await prisma.booking.findMany({
    where: { farmerid: farmerId },
    include: { Asset: true },
    orderBy: { bookingdate: 'desc' },
  });
  return bookings.map(toApiBooking);
}

async function listByOperator(operatorId, assetIds) {
  const bookings = await prisma.booking.findMany({
    where: { assetid: { in: assetIds } },
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
