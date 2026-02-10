/**
 * Central config - loads from process.env (via dotenv).
 * No hardcoded secrets. Ready for Prisma/DB URL later.
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Comma-separated origins for CORS, or '*' to allow all (e.g. "http://localhost:5173,http://localhost:3000")
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
};
