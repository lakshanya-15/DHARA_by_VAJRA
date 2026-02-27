/**
 * User service - uses Prisma (same DB as dharaa).
 */
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const ROLES = ['FARMER', 'OPERATOR', 'ADMIN'];

async function createUser({ phone, password, name, role, address }) {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    const err = new Error('Phone number already registered');
    err.statusCode = 409;
    throw err;
  }
  if (role && !ROLES.includes(role)) {
    const err = new Error('Invalid role');
    err.statusCode = 400;
    throw err;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      phone,
      password: hashedPassword,
      name: name || phone,
      address: address || '',
      role: (role || 'FARMER').toUpperCase(),
    },
  });
  return { id: user.id, phone: user.phone, name: user.name, role: user.role };
}

async function findByPhone(phone) {
  return prisma.user.findUnique({ where: { phone } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.password);
}

async function listAll() {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, role: true, createdat: true },
  });
  return users.map((u) => ({
    id: u.id,
    phone: u.phone,
    name: u.name,
    role: u.role,
    createdAt: u.createdat?.toISOString?.() ?? u.createdat,
  }));
}

module.exports = {
  createUser,
  findByPhone,
  findById,
  verifyPassword,
  listAll,
  ROLES,
};
