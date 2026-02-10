/**
 * Asset service - uses Prisma (same DB as dharaa).
 * API uses hourlyRate; DB has priceperday - we map between them (MVP: same value).
 */
const prisma = require('../config/prisma');

function toApiAsset(asset) {
  if (!asset) return null;
  return {
    id: asset.id,
    operatorId: asset.ownerid,
    name: asset.name,
    type: asset.type,
    description: '', // not in dharaa schema
    hourlyRate: Number(asset.priceperday) || 0,
    isAvailable: asset.availability ?? true,
    createdAt: asset.createdat?.toISOString?.() ?? asset.createdat,
  };
}

async function createAsset({ operatorId, name, type, description, hourlyRate }) {
  const asset = await prisma.asset.create({
    data: {
      ownerid: operatorId,
      name,
      type: type || 'MACHINERY',
      priceperday: Number(hourlyRate) || 0,
      availability: true,
    },
  });
  return toApiAsset(asset);
}

async function findById(id) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  return toApiAsset(asset);
}

async function listAll(filters = {}) {
  const where = {};
  if (filters.operatorId) where.ownerid = filters.operatorId;
  if (filters.type) where.type = filters.type;
  const assets = await prisma.asset.findMany({ where });
  return assets.map(toApiAsset);
}

async function listAllForAdmin() {
  const assets = await prisma.asset.findMany();
  return assets.map(toApiAsset);
}

module.exports = {
  createAsset,
  findById,
  listAll,
  listAllForAdmin,
};
