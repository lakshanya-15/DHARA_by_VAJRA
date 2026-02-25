const maintenanceService = require('../services/maintenanceService');
const assetService = require('../services/assetService');
const { success, error } = require('../utils/response');
const { required } = require('../utils/validation');

async function create(req, res, next) {
    try {
        const err = required(req.body, ['assetId', 'date', 'type', 'cost']);
        if (err) return error(res, err, 400);

        // Verify ownership
        const asset = await assetService.findById(req.body.assetId);
        if (!asset) return error(res, 'Asset not found', 404);
        if (asset.operatorId !== req.user.id) {
            return error(res, 'Unauthorized to log service for this asset', 403);
        }

        const log = await maintenanceService.createLog(req.body);
        return success(res, log, 201);
    } catch (e) {
        next(e);
    }
}

async function list(req, res, next) {
    try {
        let logs;
        if (req.query.assetId) {
            // Authorization check could be added here for specific asset logs
            logs = await maintenanceService.getLogsByAsset(req.query.assetId);
        } else {
            logs = await maintenanceService.getLogsByOperator(req.user.id);
        }
        return success(res, logs);
    } catch (e) {
        next(e);
    }
}

module.exports = { create, list };
