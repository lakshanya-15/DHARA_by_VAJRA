/**
 * Asset service - uses Prisma (same DB as dharaa).
 * API uses hourlyRate; DB has priceperday - we map between them (MVP: same value).
 */
const prisma = require('../config/prisma');
const bookingService = require('./bookingService');
const scoringService = require('./scoringService');

function toApiAsset(asset, userSegment = 'NEW') {
  if (!asset) return null;
  const originalRate = Number(asset.priceperday) || 0;
  const multiplier = scoringService.getDiscountMultiplier(userSegment);
  const personalizedRate = Math.round(originalRate * multiplier);

  return {
    id: asset.id,
    operatorId: asset.ownerid,
    name: asset.name,
    type: asset.type,
    description: '', // not in dharaa schema
    category: asset.category,
    attachments: asset.attachments || [],
    hourlyRate: personalizedRate,
    originalRate: personalizedRate < originalRate ? originalRate : null,
    availability: asset.availability ?? true,
    location: asset.User ? `${asset.User.village || ''}, ${asset.User.district || ''}`.replace(/^, |, $/, '') : 'Local Area',
    createdAt: asset.createdat?.toISOString?.() ?? asset.createdat,
    operatorSegment: asset.User ? asset.User.segment : 'NEW',
    operatorScore: asset.User ? asset.User.behaviorScore : 0
  };
}

async function createAsset({ operatorId, name, type, category, description, hourlyRate, attachments }) {
  const asset = await prisma.asset.create({
    data: {
      ownerid: operatorId,
      name,
      type: type || 'MACHINERY',
      category: category || 'OTHER',
      priceperday: Number(hourlyRate) || 0,
      availability: true,
      attachments: attachments || [],
    },
    include: { User: true }
  });

  return toApiAsset(asset);
}

async function findById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { User: true }
  });
  return toApiAsset(asset);
}

async function listAll(filters = {}, userSegment = 'NEW') {
  await bookingService.refreshBookingStatuses();
  const where = {};
  if (filters.operatorId) where.ownerid = filters.operatorId;
  if (filters.type) where.type = filters.type;
  if (filters.category) where.category = filters.category;
  const assets = await prisma.asset.findMany({
    where,
    include: { User: true, Booking: true }
  });

  // Sort by operatorScore if it's for farmers (i.e. not filtering by operatorId)
  if (!filters.operatorId) {
    assets.sort((a, b) => (b.User?.behaviorScore || 0) - (a.User?.behaviorScore || 0));
  }

  return assets.map(a => toApiAsset(a, userSegment));
}

async function listAllForAdmin() {
  const assets = await prisma.asset.findMany({
    include: { User: true }
  });
  return assets.map(toApiAsset);
}

async function updateAsset(id, data) {
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.type) updateData.type = data.type;
  if (data.category) updateData.category = data.category;
  if (data.hourlyRate !== undefined) updateData.priceperday = Number(data.hourlyRate);
  if (data.availability !== undefined) updateData.availability = data.availability;
  if (data.attachments !== undefined) updateData.attachments = data.attachments;

  const asset = await prisma.asset.update({
    where: { id },
    data: updateData,
    include: { User: true }
  });
  return toApiAsset(asset);
}

async function deleteAsset(id) {
  // Delete related bookings and maintenance logs first due to FK constraints
  await prisma.maintenanceLog.deleteMany({ where: { assetid: id } });
  await prisma.booking.deleteMany({ where: { assetid: id } });

  await prisma.asset.delete({
    where: { id }
  });
  return { success: true };
}

module.exports = {
  createAsset,
  findById,
  listAll,
  listAllForAdmin,
  updateAsset,
  deleteAsset,
};
