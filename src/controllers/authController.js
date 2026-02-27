/**
 * Auth controller: register and login.
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('../services/userService');
const { success, error } = require('../utils/response');
const { required, oneOf } = require('../utils/validation');

// Mock OTP storage
const otps = new Map();

async function requestOTP(req, res, next) {
  try {
    const { phone } = req.body;
    if (!phone) return error(res, 'Phone number is required', 400);

    // In a real app, send SMS here. For demo, we use 123456.
    const otp = '123456';
    otps.set(phone, otp);

    return success(res, { message: 'OTP sent to your phone (Demo: 123456)', phone });
  } catch (e) {
    next(e);
  }
}

async function verifyOTP(req, res, next) {
  try {
    const { phone, otp } = req.body;
    const storedOtp = otps.get(phone);

    if (otp !== '123456' && otp !== storedOtp) {
      return error(res, 'Invalid OTP', 401);
    }

    let user = await userService.findByPhone(phone);
    if (!user) {
      return error(res, 'User not found. Please register.', 404);
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return success(res, {
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    next(e);
  }
}

async function register(req, res, next) {
  try {
    const err = required(req.body, ['phone', 'name', 'role']);
    if (err) return error(res, err, 400);

    const user = await userService.createUser({
      phone: String(req.body.phone).trim(),
      password: 'password123', // Default password for schema compatibility
      name: String(req.body.name).trim(),
      role: req.body.role,
      address: req.body.address
    });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return success(res, { user, token }, 201);
  } catch (e) {
    if (e.statusCode) return error(res, e.message, e.statusCode);
    next(e);
  }
}

async function login(req, res, next) {
  // Legacy login for backwards compat or simplified flow
  try {
    const { phone, password } = req.body;
    const user = await userService.findByPhone(phone);
    if (!user) return error(res, 'User not found', 401);

    const valid = await userService.verifyPassword(user, password);
    if (!valid) return error(res, 'Invalid password', 401);

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return success(res, {
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404);
    return success(res, {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      segment: user.segment,
      behaviorScore: user.behaviorScore,
      walletBalance: user.walletBalance,
      address: user.address,
      village: user.village,
      district: user.district
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { requestOTP, verifyOTP, register, login, me };
