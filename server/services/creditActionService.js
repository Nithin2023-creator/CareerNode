const httpError = require('http-errors');
const { getPricingEntry } = require('../config/pricingCatalog');
const walletService = require('./walletService');
const PaymentOrder = require('../models/PaymentOrder');

/**
 * Charges a user for a flat-priced credit action, either by consuming a paid
 * a la carte order or by spending wallet credits. This is the single place any
 * controller should call to charge for such an action, so the credit-vs-cash
 * branching lives in one spot.
 *
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId|string} params.userId
 * @param {string} params.actionId - key in the pricing catalog
 * @param {string} [params.paidOrderId] - PaymentOrder id when paying a la carte
 * @param {string} params.source - wallet transaction source enum value
 * @returns {Promise<{ method: 'credits'|'alacarte', balance?: number }>}
 */
async function chargeForAction({ userId, actionId, paidOrderId, source }) {
  const entry = getPricingEntry(actionId);
  if (!entry) {
    throw httpError(400, 'Unknown action');
  }

  if (paidOrderId) {
    // Redeem a previously paid a la carte order exactly once.
    const order = await PaymentOrder.findOneAndUpdate(
      {
        _id: paidOrderId,
        userId,
        orderType: 'credit_action',
        referenceId: actionId,
        status: 'paid',
        consumedAt: null,
      },
      { $set: { consumedAt: new Date() } },
      { new: true }
    );

    if (!order) {
      throw httpError(400, 'Payment not found or already used');
    }

    return { method: 'alacarte' };
  }

  // Default: spend wallet credits (atomic $gte guard inside walletService).
  try {
    const wallet = await walletService.spendCredits(userId, entry.creditCost, entry.label, source);
    return { method: 'credits', balance: wallet.balance };
  } catch (error) {
    // Normalize the generic "Insufficient credits" into a 402 with detail so the
    // frontend can open the paywall with the right numbers.
    const wallet = await walletService.getWallet(userId).catch(() => null);
    const err = httpError(402, 'Insufficient credits');
    err.required = entry.creditCost;
    err.available = wallet ? wallet.balance : 0;
    throw err;
  }
}

module.exports = { chargeForAction };
