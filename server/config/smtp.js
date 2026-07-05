const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const verifyConnection = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.warn('SMTP credentials not fully configured. Emails will likely fail.');
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP connection established successfully.');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error.message);
    return false;
  }
};

module.exports = {
  createTransporter,
  verifyConnection,
};
