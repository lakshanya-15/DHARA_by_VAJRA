/**
 * Express app - routes and middlewares.
 * Integration points: auth, assets, bookings, admin routes; global error handler.
 */
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const config = require('./config');

const app = express();

// Allow frontend (or any client) to call the API from another origin
const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://dhara-by-vajra.vercel.app' // Explicitly add the production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);

    // If CORS_ORIGIN is '*' or if origin is in allowed list
    if (config.corsOrigin === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Root - so visiting http://localhost:3000/ shows the API is up
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rural Uber for Farm Assets API',
    docs: 'See README.md',
    endpoints: {
      health: 'GET /health',
      auth: 'POST /auth/register, POST /auth/login',
      assets: 'GET /assets, POST /assets (OPERATOR)',
      bookings: 'POST /bookings (FARMER), GET /bookings/my',
      notifications: 'GET /notifications, PATCH /notifications/:id/read',
      admin: 'GET /admin/users, GET /admin/assets, GET /admin/bookings (ADMIN)',
    },
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);
app.use('/bookings', bookingRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

// Health check (optional, useful for demos)
app.get('/health', (req, res) => res.json({ ok: true }));

// 404 - include valid endpoints so wrong path/method is easier to fix
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    hint: 'Use these paths: GET /, GET /health, GET /assets | POST /auth/register, POST /auth/login (JSON body) | POST /assets, POST /bookings, GET /bookings/my, GET /admin/users, GET /admin/assets, GET /admin/bookings (need Authorization: Bearer <token>)',
  });
});

// Global error handler (secure: no stack in production)
app.use(errorHandler);

module.exports = app;
