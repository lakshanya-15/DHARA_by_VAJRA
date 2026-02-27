const disputeService = require('../services/disputeService');
const bookingService = require('../services/bookingService');
const { success, error } = require('../utils/response');

async function raiseDispute(req, res, next) {
    try {
        const { bookingId, reason } = req.body;
        const booking = await bookingService.findById(bookingId);

        if (!booking) return error(res, 'Booking not found', 404);
        if (booking.farmerId !== req.user.id) return error(res, 'Unauthorized', 403);

        const dispute = await disputeService.createDispute({
            bookingId,
            farmerId: req.user.id,
            reason
        });

        return success(res, dispute, 201);
    } catch (e) {
        next(e);
    }
}

module.exports = { raiseDispute };
