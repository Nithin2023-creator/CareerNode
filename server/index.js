require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { campaignService } = require('./services/campaignService');
const { startMembershipRenewalJob } = require('./services/membershipRenewalJob');

const campaignRoutes = require('./routes/campaigns.routes');
const csvImportRoutes = require('./routes/csvImports.routes');
const smtpSettingsRoutes = require('./routes/smtpSettings.routes');
const bundlesRoutes = require('./routes/bundles.routes');
const walletRoutes = require('./routes/wallet.routes');
const waitlistRoutes = require('./routes/waitlist.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const membershipRoutes = require('./routes/membership.routes');
const subscriptionsRoutes = require('./routes/subscriptions.routes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
    const recovered = await campaignService.recoverOrphanedCampaigns();
    if (recovered > 0) {
      console.log(`Recovered ${recovered} orphaned campaign(s) stuck in 'Sending' -> 'Paused'.`);
    }
    
    // Start background jobs
    startMembershipRenewalJob();
  } catch (error) {
    console.error('Failed to recover orphaned campaigns:', error.message);
  }
});

// Allow one or more comma-separated client origins (Vite dev + prod).
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const paymentsRoutes = require('./routes/payments.routes');

app.use(cors({ origin: allowedOrigins }));

// Webhook route requires raw body for signature verification
app.use('/api/payments', express.raw({ type: 'application/json' }), paymentsRoutes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded attachments (resumes / cover letters).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/campaigns', campaignRoutes);
app.use('/api/csv-imports', csvImportRoutes);
app.use('/api/smtp-settings', smtpSettingsRoutes);
app.use('/api/bundles', bundlesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Centralized error handler: honors service-thrown statusCode, defaults to 500.
app.use((err, req, res, _next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('Unhandled error:', err.stack || err.message);
  }
  res.status(status).json({ error: err.message || 'An unexpected error occurred on the server.' });
});

app.listen(PORT, () => {
  console.log(`CareerNode server running on port ${PORT}`);
});
