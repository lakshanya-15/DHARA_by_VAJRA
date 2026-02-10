/**
 * Admin controller: list all users, assets, and bookings (ADMIN only).
 */
const userService = require('../services/userService');
const assetService = require('../services/assetService');
const bookingService = require('../services/bookingService');
const { success } = require('../utils/response');

async function getUsers(req, res, next) {
  try {
    const users = await userService.listAll();
    return success(res, users);
  } catch (e) {
    next(e);
  }
}

async function getAssets(req, res, next) {
  try {
    const assets = assetService.listAllForAdmin();
    return success(res, assets);
  } catch (e) {
    next(e);
  }
}

async function getBookings(req, res, next) {
  try {
    const bookings = bookingService.listAllForAdmin();
    return success(res, bookings);
  } catch (e) {
    next(e);
  }
}

module.exports = { getUsers, getAssets, getBookings };
