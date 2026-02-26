/**
 * Asset controller: create (OPERATOR), list (public).
 */
const assetService = require('../services/assetService');
const { success, error } = require('../utils/response');
const { required } = require('../utils/validation');

async function uploadImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, 'No images provided', 400);
    }
    // multer-storage-cloudinary attaches the secure_url to the path property
    const imageUrls = req.files.map(file => file.path);
    return success(res, { images: imageUrls }, 200);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const err = required(req.body, ['name', 'hourlyRate']);
    if (err) return error(res, err, 400);

    const asset = await assetService.createAsset({
      operatorId: req.user.id,
      name: String(req.body.name),
      type: req.body.type,
      category: req.body.category,
      description: req.body.description,
      hourlyRate: req.body.hourlyRate,
      images: req.body.images || [], // Save images directly
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
    if (req.query.category) filters.category = req.query.category;
    const assets = await assetService.listAll(filters);
    return success(res, assets);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const asset = await assetService.findById(req.params.id);
    if (!asset) return error(res, 'Asset not found', 404);

    // Check ownership
    if (asset.operatorId !== req.user.id) {
      return error(res, 'Unauthorized to update this asset', 403);
    }

    const updated = await assetService.updateAsset(req.params.id, req.body);
    return success(res, updated);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const asset = await assetService.findById(req.params.id);
    if (!asset) return error(res, 'Asset not found', 404);

    // Check ownership
    if (asset.operatorId !== req.user.id) {
      return error(res, 'Unauthorized to delete this asset', 403);
    }

    await assetService.deleteAsset(req.params.id);
    return success(res, { message: 'Asset deleted successfully' });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list, update, remove, uploadImages };
