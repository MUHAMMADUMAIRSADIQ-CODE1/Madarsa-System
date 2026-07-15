const crypto = require('crypto');

function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateNumericOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function sanitizeObject(obj, allowedFields) {
  return Object.keys(obj).reduce((acc, key) => {
    if (allowedFields.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildSortObject(sortBy, sortOrder = 'desc') {
  const order = sortOrder === 'asc' ? 1 : -1;
  return { [sortBy || 'createdAt']: order };
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

function toObjectId(id) {
  const mongoose = require('mongoose');
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

module.exports = {
  generateRandomString,
  generateNumericOTP,
  slugify,
  sanitizeObject,
  parsePagination,
  buildSortObject,
  maskEmail,
  toObjectId,
};
