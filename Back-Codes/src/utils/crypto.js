const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');

function generateSecurePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

function generateUsername(firstName, lastName, schoolCode, sequence) {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  const school = schoolCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${school}_${base}${sequence > 1 ? sequence : ''}`;
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, config.security.bcryptRounds);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  generateSecurePassword,
  generateUsername,
  hashPassword,
  comparePassword,
  generateToken,
  sha256,
};
