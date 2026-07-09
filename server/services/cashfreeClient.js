const { Cashfree, CFEnvironment } = require('cashfree-pg');

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

const cashfreeInstance = new Cashfree();

const verifyWebhookSignature = (signature, rawBody, timestamp) => {
  try {
    cashfreeInstance.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return true;
  } catch (error) {
    console.error('Error verifying webhook signature:', error.message);
    return false;
  }
};

module.exports = {
  Cashfree: cashfreeInstance,
  verifyWebhookSignature,
};
