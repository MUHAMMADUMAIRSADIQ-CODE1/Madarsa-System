const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

function generateOrderNumber(prefix = 'JTU') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
}

function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

function parseDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${mins}m`;
}

function getDateRange(filter) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today': {
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      return { start: startOfDay, end: endOfDay };
    }
    case 'week': {
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return { start: startOfWeek, end: endOfWeek };
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start: startOfMonth, end: endOfMonth };
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      return { start: startOfYear, end: endOfYear };
    }
    default:
      return { start: null, end: null };
  }
}

module.exports = {
  generateOrderNumber,
  calculatePercentage,
  parseDuration,
  getDateRange,
};
