const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree();

// Initialize the Cashfree environment
cashfree.XClientId = process.env.CASHFREE_APP_ID;
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? CFEnvironment.PRODUCTION 
  : CFEnvironment.SANDBOX;

const verifyWebhookSignature = (signature, rawBody, timestamp) => {
  try {
    return cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

module.exports = {
  Cashfree: cashfree,
  verifyWebhookSignature,
};
