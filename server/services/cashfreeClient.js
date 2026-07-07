const { Cashfree: CashfreeSDK } = require('cashfree-pg');

const environment =
  process.env.CASHFREE_ENV === 'PRODUCTION' ? CashfreeSDK.PRODUCTION : CashfreeSDK.SANDBOX;

const cashfree = new CashfreeSDK(
  environment,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

const verifyWebhookSignature = (signature, rawBody, timestamp) => {
  try {
    CashfreeSDK.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return true;
  } catch (error) {
    console.error('Error verifying webhook signature:', error.message);
    return false;
  }
};

module.exports = {
  Cashfree: cashfree,
  verifyWebhookSignature,
};
