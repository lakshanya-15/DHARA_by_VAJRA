/**
 * Prisma client singleton for the backend.
 * Uses the same database as dharaa (DATABASE_URL in .env).
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
