// Load environment-specific config: .env.local (dev) or .env.production (prod)
// then fall back to .env for any shared / base values.
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.local';

// Environment-specific file first (values set here win)
dotenv.config({ path: path.join(__dirname, envFile) });
// Base .env as fallback (won't overwrite already-set keys)
dotenv.config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { campaignService } = require('./services/campaignService');
const { startMembershipRenewalJob } = require('./services/membershipRenewalJob');

const campaignRoutes = require('./routes/campaigns.routes');
const csvImportRoutes = require('./routes/csvImports.routes');
const gmailConnectionRoutes = require('./routes/gmailConnection.routes');
const bundlesRoutes = require('./routes/bundles.routes');
const walletRoutes = require('./routes/wallet.routes');
const waitlistRoutes = require('./routes/waitlist.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const membershipRoutes = require('./routes/membership.routes');
const subscriptionsRoutes = require('./routes/subscriptions.routes');
const resumesRoutes = require('./routes/resumes.routes');
const pricingRoutes = require('./routes/pricing.routes');

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
app.use('/api/gmail-connection', gmailConnectionRoutes);
app.use('/api/bundles', bundlesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/pricing', pricingRoutes);

// Centralized error handler: honors service-thrown statusCode, defaults to 500.
app.use((err, req, res, _next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('Unhandled error:', err.stack || err.message);
  }
  // Pass through any extra structured fields set on the error (e.g. `required`,
  // `available` for insufficient-credit responses) without controllers having
  // to hand-roll the JSON body.
  const { message, statusCode, status: _statusField, stack, expose, ...extra } = err;
  res.status(status).json({
    error: err.message || 'An unexpected error occurred on the server.',
    ...extra,
  });
});

app.listen(PORT, () => {
  console.log(`CareerNode server running on port ${PORT}`);
});
