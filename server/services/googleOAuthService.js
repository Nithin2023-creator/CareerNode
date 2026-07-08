const { OAuth2Client } = require('google-auth-library');

const getClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );
};

const exchangeCodeForTokens = async (code) => {
  const client = getClient();
  const { tokens } = await client.getToken(code);
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
  return message.includes('invalid_grant');
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

module.exports = { exchangeCodeForTokens, revokeToken, getClient, verifyConnection };
