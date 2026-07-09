const httpError = require('http-errors');
const { pricingCatalog, getPricingEntry } = require('../config/pricingCatalog');
const paymentService = require('../services/paymentService');

// GET /api/pricing
// Returns the flat-priced action catalog so the frontend never hardcodes numbers.
exports.getCatalog = async (req, res, next) => {
  try {
    res.json({ data: pricingCatalog });
  } catch (error) {
    next(error);
  }
};

// POST /api/pricing/:actionId/checkout
// Creates a Cashfree order for a one-off a la carte purchase of a credit action.
// The price is always resolved server-side from the catalog (never trusted from the client).
exports.checkoutAction = async (req, res, next) => {
  try {
    const { actionId } = req.params;
    const entry = getPricingEntry(actionId);

    if (!entry) {
      throw httpError(404, 'Unknown action');
    }

    const { orderId, paymentSessionId } = await paymentService.createOrder({
      userId: req.user._id,
      amount: entry.cashPriceInr,
      orderType: 'credit_action',
      referenceId: actionId,
      customerDetails: {
        name: req.user.name,
        email: req.user.email,
      },
    });

    res.json({ data: { orderId, paymentSessionId } });
  } catch (error) {
    next(error);
  }
};
