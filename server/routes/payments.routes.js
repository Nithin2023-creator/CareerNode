const express = require('express');
const { processWebhook } = require('../services/paymentWebhookService');

const router = express.Router();

// The webhook needs the raw body for signature verification.
// We handle parsing raw body in server/index.js or directly here.
// Assuming server/index.js maps this route with express.raw()
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.body; // Assuming express.raw() has populated this with a Buffer or string

    if (!signature || !timestamp || !rawBody) {
      return res.status(400).send('Missing webhook signature, timestamp, or body');
    }

    // Cashfree PGVerifyWebhookSignature expects raw body as string
    const bodyString = rawBody.toString('utf8');
    const bodyJson = JSON.parse(bodyString);

    await processWebhook(signature, bodyString, timestamp, bodyJson);
    
    // Always return 200 to acknowledge receipt and prevent retries for successful processing
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error.message);
    // Return 500 so Cashfree will retry if it's a transient failure (e.g. DB down)
    res.status(500).send('Webhook processing failed');
  }
});

module.exports = router;
