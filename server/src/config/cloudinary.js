const cloudinary = require('cloudinary').v2;
const env = require('./env');
const logger = require('../utils/logger');

function initializeCloudinary() {
  try {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });

    logger.info('Cloudinary configured successfully');
    return cloudinary;
  } catch (error) {
    logger.error('Cloudinary configuration failed:', error.message);
    throw error;
  }
}

function getCloudinary() {
  return cloudinary;
}

module.exports = { initializeCloudinary, getCloudinary };
