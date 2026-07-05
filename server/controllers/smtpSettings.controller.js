const { verifyConnection } = require('../config/smtp');

const maskEmail = (user) => {
  if (!user || user === 'your_email@gmail.com') return 'Not configured';
  const parts = user.split('@');
  if (parts.length !== 2) return '***';
  const [name, domain] = parts;
  return name.length > 3 ? `${name.substring(0, 3)}***@${domain}` : `***@${domain}`;
};

// GET /api/smtp-settings
const getSmtpSettings = (req, res) => {
  res.json({
    data: {
      email: maskEmail(process.env.SMTP_USER || ''),
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      fromName: process.env.SMTP_FROM_NAME || 'CareerNode',
    },
  });
};

// POST /api/smtp-settings/test-connection
const testConnection = async (req, res) => {
  const isConnected = await verifyConnection();
  if (isConnected) {
    res.json({ data: { success: true, message: 'SMTP connection successful' } });
  } else {
    res.status(500).json({ error: 'SMTP connection failed. Check your credentials.' });
  }
};

module.exports = { getSmtpSettings, testConnection };
