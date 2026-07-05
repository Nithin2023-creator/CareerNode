const { createTransporter } = require('../config/smtp');
const path = require('path');
const fs = require('fs');

const emailService = {
  /**
   * Send an individual email.
   * @param {Object} options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.body - Email body (plain text with newlines)
   * @param {String} [options.resumeUrl] - Filename of resume attachment
   * @param {String} [options.coverLetterUrl] - Filename of cover letter attachment
   */
  async sendEmail({ to, subject, body, resumeUrl, coverLetterUrl }) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'CareerNode'}" <${process.env.SMTP_USER}>`,
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

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  },
};

module.exports = emailService;
