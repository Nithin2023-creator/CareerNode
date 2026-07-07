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

module.exports = { exchangeCodeForTokens, revokeToken, getClient };
