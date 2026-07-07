const GmailConnection = require('../models/GmailConnection');
const googleOAuthService = require('../services/googleOAuthService');
const { encrypt, decrypt } = require('../utils/tokenCrypto');
const httpError = require('http-errors');

const getStatus = async (req, res, next) => {
  try {
    const connection = await GmailConnection.findOne({ userId: req.user._id });
    if (!connection) {
      return res.json({ data: { connected: false } });
    }
    res.json({
      data: {
        connected: connection.status === 'active',
        email: connection.email,
        status: connection.status,
        connectedAt: connection.connectedAt,
      },
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
    const userInfoResponse = await client.request({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });
    const email = userInfoResponse.data.email;

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
      },
      { upsert: true, new: true }
    );

    res.json({
      data: {
        connected: true,
        email: connection.email,
        status: connection.status,
        connectedAt: connection.connectedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

const disconnect = async (req, res, next) => {
  try {
    const connection = await GmailConnection.findOne({ userId: req.user._id });
    if (connection) {
      try {
        const decryptedToken = decrypt(connection.refreshTokenEnc);
        await googleOAuthService.revokeToken(decryptedToken);
      } catch(e) {
        console.error("Failed to revoke token, deleting anyway", e);
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
    const client = googleOAuthService.getClient();
    client.setCredentials({ refresh_token: decrypt(connection.refreshTokenEnc) });
    await client.getAccessToken();
    
    res.json({ data: { success: true } });
  } catch (err) {
    if (err.statusCode) return next(err);
    next(httpError(500, 'Failed to verify Gmail connection: ' + err.message));
  }
};

module.exports = { getStatus, connect, disconnect, testConnection };
