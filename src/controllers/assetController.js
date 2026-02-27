/**
 * Asset controller: create (OPERATOR), list (public).
 */
const assetService = require('../services/assetService');
const { calculateScore, getSegment, getDiscountMultiplier } = require('../services/scoringService');
const prisma = require('../config/prisma');
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
      category: req.body.category,
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
    if (req.query.category) filters.category = req.query.category;
    const assets = await assetService.listAll(filters);

    // Dynamic Recommendation Engine:
    // 1. Availability (Available assets first)
    // 2. Operator Tier (PREMIUM > LOYAL > REGULAR > NEW)
    // 3. Operator Score (Higher score first)
    const segmentOrder = { 'PREMIUM': 4, 'LOYAL': 3, 'REGULAR': 2, 'NEW': 1 };

    // Fetch user for profiling if they are a farmer
    let user = null;
    if (req.user && req.user.role === 'FARMER') {
      user = await prisma.user.findUnique({ where: { id: req.user.id } });
    }

    assets.sort((a, b) => {
      // 1. Availability
      if (a.availability !== b.availability) return a.availability ? -1 : 1;

      // 2. Personalized Preference (Categories previously booked)
      if (user && user.preferredCategories) {
        const prefs = user.preferredCategories;
        const aIndex = prefs.indexOf(a.category);
        const bIndex = prefs.indexOf(b.category);
        if (aIndex !== bIndex) {
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }
      }

      // Priority 3: Operator Segment
      const segmentDiff = segmentOrder[b.operatorSegment] - segmentOrder[a.operatorSegment];
      if (segmentDiff !== 0) return segmentDiff;

      // Priority 4: Behavior Score
      return (b.operatorScore || 0) - (a.operatorScore || 0);
    });

    if (user) {
      const farmerSegment = user.segment || 'NEW';
      const discountMult = getDiscountMultiplier(farmerSegment);

      const updatedAssets = assets.map(a => {
        // Step 1: Calculate Operator Service Markup (Premium service costs more)
        let operatorMarkup = 1.0;
        if (a.operatorSegment === 'PREMIUM') operatorMarkup = 1.15; // 15% quality markup
        if (a.operatorSegment === 'LOYAL') operatorMarkup = 1.05;   // 5% quality markup

        const standardPrice = Math.round(a.hourlyRate * operatorMarkup);

        // Step 2: Apply Farmer Loyalty Discount
        const discountedPrice = Math.round(standardPrice * discountMult);

        // Step 3: Populate response with pricing breakdown
        return {
          ...a,
          originalRate: standardPrice, // The price before farmer specific discount
          hourlyRate: discountedPrice,  // The final price for this customer
          appliedDiscount: Math.round((1 - discountMult) * 100),
          farmerSegment: farmerSegment
        };
      });
      return success(res, updatedAssets);
    }

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

module.exports = { create, list, update, remove };
