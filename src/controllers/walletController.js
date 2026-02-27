const walletService = require('../services/walletService');
const { success, error } = require('../utils/response');

async function getMyWallet(req, res, next) {
    try {
        const balance = await walletService.getBalance(req.user.id);
        const transactions = await walletService.getTransactions(req.user.id);
        return success(res, { balance, transactions });
    } catch (e) {
        next(e);
    }
}

async function deposit(req, res, next) {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return error(res, 'Invalid amount', 400);

        const newBalance = await walletService.addFunds(req.user.id, parseFloat(amount));
        return success(res, { balance: newBalance, message: 'Deposit successful' });
    } catch (e) {
        next(e);
    }
}

module.exports = { getMyWallet, deposit };
