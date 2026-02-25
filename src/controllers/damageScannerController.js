const damageScannerService = require('../services/damageScannerService');

const create = async (req, res) => {
    try {
        const { bookingid, scanType, image, healthScore, issues } = req.body;

        if (!bookingid || !scanType || !image) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const record = await damageScannerService.createRecord({
            bookingid,
            scanType,
            image,
            healthScore,
            issues
        });

        res.status(201).json({
            message: 'Damage record saved successfully',
            data: record
        });
    } catch (error) {
        console.error('Damage scanner creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const records = await damageScannerService.getByBooking(bookingId);
        res.json({ data: records });
    } catch (error) {
        console.error('Damage scanner fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    create,
    getByBooking
};
