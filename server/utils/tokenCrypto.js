const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

const getKey = () => {
  const envKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
  }
  if (Buffer.byteLength(envKey, 'utf8') < 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be at least 32 bytes');
  }
  const keyBuffer = Buffer.from(envKey, 'utf8');
  const validKey = Buffer.alloc(32);
  keyBuffer.copy(validKey);
  return validKey;
};

const encrypt = (text) => {
  const validKey = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, validKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decrypt = (cipherText) => {
  const validKey = getKey();
  const parts = cipherText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted token format');
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, validKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };
