/**
 * User service - uses Prisma (same DB as dharaa).
 */
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const ROLES = ['FARMER', 'OPERATOR', 'ADMIN'];

async function createUser({ email, password, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
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
      email,
      password: hashedPassword,
      name: name || email,
      role: (role || 'FARMER').toUpperCase(),
    },
  });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.password);
}

async function listAll() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdat: true },
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdat?.toISOString?.() ?? u.createdat,
  }));
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  verifyPassword,
  listAll,
  ROLES,
};
