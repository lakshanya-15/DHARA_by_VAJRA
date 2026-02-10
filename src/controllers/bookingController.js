/**
 * Booking controller: create (FARMER), get my bookings (role-based).
 */
const assetService = require('../services/assetService');
const bookingService = require('../services/bookingService');
const { success, error } = require('../utils/response');
const { required } = require('../utils/validation');

async function create(req, res, next) {
  try {
    const err = required(req.body, ['assetId', 'startDate']);
    if (err) return error(res, err, 400);

    const asset = await assetService.findById(req.body.assetId);
    if (!asset) return error(res, 'Asset not found', 404);

    const booking = await bookingService.createBooking({
      farmerId: req.user.id,
      assetId: req.body.assetId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      notes: req.body.notes,
    });
    return success(res, booking, 201);
  } catch (e) {
    next(e);
  }
}

async function getMy(req, res, next) {
  try {
    const role = req.user.role;
    let list;
    if (role === 'FARMER') {
      list = await bookingService.listByFarmer(req.user.id);
    } else if (role === 'OPERATOR') {
      const assets = await assetService.listAll({ operatorId: req.user.id });
      const assetIds = assets.map((a) => a.id);
      list = await bookingService.listByOperator(req.user.id, assetIds);
    } else {
      // ADMIN: for "my" we return empty or could return all; spec says role-based "my"
      list = [];
    }
    return success(res, list);
  } catch (e) {
    next(e);
  }
}

module.exports = { create, getMy };
