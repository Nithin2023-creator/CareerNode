const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfreeInstance = new Cashfree();

cashfreeInstance.XClientId = process.env.CASHFREE_APP_ID;
cashfreeInstance.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfreeInstance.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

console.log('[Cashfree] Initialized:', {
  env: process.env.CASHFREE_ENV,
  appId: process.env.CASHFREE_APP_ID ? process.env.CASHFREE_APP_ID.substring(0, 8) + '...' : 'MISSING',
  secret: process.env.CASHFREE_SECRET_KEY ? 'SET' : 'MISSING',
});

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

