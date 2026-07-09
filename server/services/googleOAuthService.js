const { OAuth2Client } = require('google-auth-library');

const REDIRECT_URI = 'postmessage';

class GoogleOAuthConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GoogleOAuthConfigError';
  }
}

const getClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missing = [!clientId && 'GOOGLE_CLIENT_ID', !clientSecret && 'GOOGLE_CLIENT_SECRET']
      .filter(Boolean)
      .join(', ');
    throw new GoogleOAuthConfigError(
      `Server is missing required Google OAuth env var(s): ${missing}. Gmail connect cannot work until these are set and the server is restarted.`
    );
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: REDIRECT_URI,
  });
};

const exchangeCodeForTokens = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Authorization code is required');
  }

  const client = getClient();
  const { tokens } = await client.getToken({
    code,
    redirect_uri: REDIRECT_URI,
  });
  return tokens;
};

const revokeToken = async (token) => {
  const client = getClient();
  try {
    await client.revokeToken(token);
  } catch (error) {
    console.error('Error revoking token:', error);
    // Suppress error so we can still clean up our database
  }
};

const isRevokedError = (err) => {
  const message = err?.message || '';
  const description = err?.response?.data?.error_description || '';
  const code = err?.response?.data?.error || '';
  return (
    message.includes('invalid_grant') ||
    description.includes('invalid_grant') ||
    code === 'invalid_grant'
  );
};

const isDecryptError = (err) => {
  const message = err?.message || '';
  return (
    message.includes('Invalid encrypted token') ||
    message.includes('TOKEN_ENCRYPTION_KEY') ||
    message.includes('Unsupported state') ||
    message.includes('auth tag')
  );
};

const verifyConnection = async (connection, refreshToken) => {
  const client = getClient();
  try {
    client.setCredentials({ refresh_token: refreshToken });
    await client.getAccessToken();
    connection.lastVerifiedAt = new Date();
    await connection.save();
    return { verified: true };
  } catch (err) {
    const message = err?.message || 'Unknown error';
    if (isRevokedError(err)) {
      connection.status = 'revoked';
      await connection.save();
      return {
        verified: false,
        revoked: true,
        message: 'Gmail access was revoked. Please reconnect.',
      };
    }
    return { verified: false, revoked: false, message };
  }
};

module.exports = {
  exchangeCodeForTokens,
  revokeToken,
  getClient,
  verifyConnection,
  isRevokedError,
  isDecryptError,
  GoogleOAuthConfigError,
};
