const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);

const emailValidator = {
  isValidSyntax(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Verify an email: syntax check + domain MX record lookup.
   * @param {string} email
   * @returns {Promise<{valid: boolean, reason?: string}>}
   */
  async verifyEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, reason: 'Empty or invalid email address' };
    }

    email = email.trim().toLowerCase();

    if (!this.isValidSyntax(email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return { valid: false, reason: 'No domain found in email' };
    }

    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, reason: `No mail server found for domain "${domain}"` };
      }
      return { valid: true };
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        return { valid: false, reason: `Domain "${domain}" does not exist or cannot receive emails` };
      }
      if (error.code === 'ETIMEOUT') {
        console.warn(`DNS timeout checking ${domain}, proceeding anyway`);
        return { valid: true };
      }
      return { valid: false, reason: `DNS lookup failed for "${domain}": ${error.message}` };
    }
  },
};

module.exports = emailValidator;
