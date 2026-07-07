const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const { decrypt } = require('../utils/tokenCrypto');
const path = require('path');
const fs = require('fs');

const emailService = {
  /**
   * Send an individual email.
   * @param {Object} options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.body - Email body (plain text with newlines)
   * @param {Object} options.connection - GmailConnection object
   * @param {String} [options.resumeUrl] - Filename of resume attachment
   * @param {String} [options.coverLetterUrl] - Filename of cover letter attachment
   */
  async sendEmail({ to, subject, body, connection, resumeUrl, coverLetterUrl }) {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      const refreshToken = decrypt(connection.refreshTokenEnc);
      client.setCredentials({ refresh_token: refreshToken });

      const transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
        buffer: true
      });

      const mailOptions = {
        from: `"CareerNode" <${connection.email}>`,
        to: to,
        subject: subject,
        html: body.replace(/\n/g, '<br>'),
        text: body,
        attachments: [],
      };

      const uploadDir = path.join(__dirname, '..', 'uploads');

      if (resumeUrl) {
        const resumePath = path.join(uploadDir, resumeUrl);
        if (fs.existsSync(resumePath)) {
          mailOptions.attachments.push({
            filename: resumeUrl.split('-').slice(0, -1).join('-') + path.extname(resumeUrl),
            path: resumePath,
          });
        }
      }

      if (coverLetterUrl) {
        const coverPath = path.join(uploadDir, coverLetterUrl);
        if (fs.existsSync(coverPath)) {
          mailOptions.attachments.push({
            filename: coverLetterUrl.split('-').slice(0, -1).join('-') + path.extname(coverLetterUrl),
            path: coverPath,
          });
        }
      }

      const mail = await transporter.sendMail(mailOptions);
      
      const rawMessage = mail.message.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const res = await client.request({
        url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        method: 'POST',
        data: { raw: rawMessage }
      });

      return { success: true, messageId: res.data.id };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error_description || error.response?.data?.error?.message || error.message };
    }
  },
};

module.exports = emailService;
