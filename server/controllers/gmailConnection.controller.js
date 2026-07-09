const GmailConnection = require('../models/GmailConnection');
const googleOAuthService = require('../services/googleOAuthService');
const { encrypt, decrypt } = require('../utils/tokenCrypto');
const httpError = require('http-errors');
const { campaignService } = require('../services/campaignService');
const coldMailerPricing = require('../config/coldMailerPricing');

const VERIFY_TTL_MS = 5 * 60 * 1000;

const buildStatusResponse = (connection) => ({
  connected: connection.status === 'active',
  email: connection.email,
  status: connection.status,
  connectedAt: connection.connectedAt,
});

const isVerificationStale = (connection) => {
  if (!connection.lastVerifiedAt) return true;
  const lastVerifiedMs = new Date(connection.lastVerifiedAt).getTime();
  if (Number.isNaN(lastVerifiedMs)) return true;
  return Date.now() - lastVerifiedMs > VERIFY_TTL_MS;
};

const markConnectionRevoked = async (connection) => {
  connection.status = 'revoked';
  try {
    await connection.save();
  } catch (saveErr) {
    console.error('Failed to persist revoked Gmail connection status:', saveErr.message);
  }
};

const verifyActiveConnection = async (connection) => {
  if (connection.status !== 'active' || !isVerificationStale(connection)) {
    return;
  }

  let refreshToken;
  try {
    refreshToken = decrypt(connection.refreshTokenEnc);
  } catch (err) {
    console.error('Gmail token decrypt failed during status check:', err.message);
    if (googleOAuthService.isDecryptError(err)) {
      await markConnectionRevoked(connection);
    }
    return;
  }

  try {
    await googleOAuthService.verifyConnection(connection, refreshToken);
  } catch (err) {
    console.error('Gmail verification failed during status check:', err.message);
  }
};

const getEmailFromIdToken = (idToken) => {
  if (!idToken) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8')
    );
    return payload.email || null;
  } catch {
    return null;
  }
};

const mapGoogleError = (err, fallbackMessage) => {
  if (err.statusCode) return err;

  if (err instanceof googleOAuthService.GoogleOAuthConfigError) {
    console.error('Gmail OAuth config error:', err.message);
    return httpError(500, 'Gmail is not configured on the server yet. Please contact support.');
  }

  const googleError = err.response?.data?.error || '';
  const message =
    err.response?.data?.error_description ||
    err.response?.data?.error?.message ||
    googleError ||
    err.message ||
    fallbackMessage;

  console.error('Gmail OAuth error:', {
    error: googleError,
    description: err.response?.data?.error_description,
    message: err.message,
  });

  if (googleOAuthService.isRevokedError(err) || String(message).includes('invalid_grant')) {
    return httpError(400, 'Google authorization expired. Please connect again.');
  }

  if (
    String(googleError).includes('invalid_request') ||
    String(message).includes('invalid_request') ||
    String(message).includes('Missing parameter: redirect_uri')
  ) {
    return httpError(
      400,
      'Google authorization failed. Please close the popup and click Connect with Google again.'
    );
  }

  if (String(message).includes('redirect_uri_mismatch')) {
    return httpError(400, 'Google OAuth redirect configuration is invalid.');
  }

  return httpError(500, `${fallbackMessage}: ${message}`);
};

const getStatus = async (req, res, next) => {
  try {
    const connection = await GmailConnection.findOne({ userId: req.user._id });
    if (!connection) {
      return res.json({ data: { connected: false } });
    }

    await verifyActiveConnection(connection);
    const dailyRemaining = await campaignService.getDailySendRemaining(req.user._id);

    res.json({
      data: {
        ...buildStatusResponse(connection),
        sentToday: connection.sentToday || 0,
        dailyRemaining,
        dailyLimit: coldMailerPricing.dailySendLimit
      }
    });
  } catch (err) {
    next(err);
  }
};

const connect = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) throw httpError(400, 'Authorization code is required');

    const tokens = await googleOAuthService.exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      throw httpError(400, 'No refresh token received. Please fully disconnect from Google Account settings and try again.');
    }

    const scopes = (tokens.scope || '').split(' ');
    if (!scopes.includes('https://www.googleapis.com/auth/gmail.send')) {
      throw httpError(400, 'gmail.send scope was not granted. Please allow sending email on your behalf.');
    }

    const client = googleOAuthService.getClient();
    client.setCredentials(tokens);

    let email = getEmailFromIdToken(tokens.id_token);
    if (!email) {
      const userInfoResponse = await client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      });
      email = userInfoResponse.data.email;
    }

    if (!email) {
      throw httpError(400, 'Could not read your Google account email. Please reconnect and allow email access.');
    }

    const encryptedToken = encrypt(tokens.refresh_token);

    const connection = await GmailConnection.findOneAndUpdate(
      { userId: req.user._id },
      {
        email,
        refreshTokenEnc: encryptedToken,
        scope: tokens.scope,
        status: 'active',
        connectedAt: new Date(),
        lastUsedAt: new Date(),
        lastVerifiedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ data: buildStatusResponse(connection) });
  } catch (err) {
    next(mapGoogleError(err, 'Failed to connect Gmail'));
  }
};

const disconnect = async (req, res, next) => {
  try {
    const connection = await GmailConnection.findOne({ userId: req.user._id });
    if (connection) {
      try {
        const decryptedToken = decrypt(connection.refreshTokenEnc);
        await googleOAuthService.revokeToken(decryptedToken);
      } catch (e) {
        console.error('Failed to revoke token, deleting anyway', e);
      }
      await connection.deleteOne();
    }
    res.json({ data: { connected: false } });
  } catch (err) {
    next(err);
  }
};

const testConnection = async (req, res, next) => {
  try {
    const connection = await GmailConnection.findOne({ userId: req.user._id });
    if (!connection || connection.status !== 'active') {
      throw httpError(400, 'Gmail not connected or revoked');
    }

    let refreshToken;
    try {
      refreshToken = decrypt(connection.refreshTokenEnc);
    } catch (err) {
      if (googleOAuthService.isDecryptError(err)) {
        await markConnectionRevoked(connection);
        throw httpError(400, 'Gmail connection is invalid. Please reconnect.');
      }
      throw err;
    }

    const result = await googleOAuthService.verifyConnection(connection, refreshToken);

    if (result.verified) {
      return res.json({ data: { success: true } });
    }

    if (result.revoked) {
      throw httpError(400, result.message);
    }

    throw httpError(500, 'Failed to verify Gmail connection: ' + result.message);
  } catch (err) {
    if (err.statusCode) return next(err);
    next(mapGoogleError(err, 'Failed to verify Gmail connection'));
  }
};

module.exports = { getStatus, connect, disconnect, testConnection };
