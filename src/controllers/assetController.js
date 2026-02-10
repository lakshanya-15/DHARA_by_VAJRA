/**
 * Asset controller: create (OPERATOR), list (public).
 */
const assetService = require('../services/assetService');
const { success, error } = require('../utils/response');
const { required } = require('../utils/validation');

async function create(req, res, next) {
  try {
    const err = required(req.body, ['name', 'hourlyRate']);
    if (err) return error(res, err, 400);

    const asset = await assetService.createAsset({
      operatorId: req.user.id,
      name: String(req.body.name || '').trim(),
      type: req.body.type,
      description: req.body.description,
      hourlyRate: req.body.hourlyRate,
    });
    return success(res, asset, 201);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const filters = {};
    if (req.query.operatorId) filters.operatorId = req.query.operatorId;
    if (req.query.type) filters.type = req.query.type;
    const assets = await assetService.listAll(filters);
    return success(res, assets);
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list };
