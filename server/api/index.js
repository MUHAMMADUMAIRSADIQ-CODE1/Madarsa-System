/**
 * Vercel Serverless Function Entry Point
 *
 * This file wraps the Express app for Vercel's serverless environment.
 * It handles:
 * - Database connection caching across warm starts
 * - Graceful error handling for cold starts
 * - In-memory request buffering while DB connects
 */
const app = require('../src/app');
const { connectDB, getConnectionStatus } = require('../src/config/db');
const logger = require('../src/utils/logger');
const { initializeCloudinary } = require('../src/config/cloudinary');

// Track DB connection state across serverless warm starts
let initializationComplete = false;
let initializationInProgress = false;
let initializationPromise = null;

async function initialize() {
  if (initializationComplete) return;
  if (initializationInProgress) return initializationPromise;

  initializationInProgress = true;

  initializationPromise = (async () => {
    try {
      // Connect to MongoDB
      await connectDB();

      // Initialize Cloudinary (non-fatal if it fails)
      try {
        initializeCloudinary();
      } catch (cloudinaryError) {
        logger.warn('Cloudinary initialization skipped:', cloudinaryError.message);
      }

      initializationComplete = true;
      logger.info('Serverless function initialized successfully');
    } catch (error) {
      logger.error('Serverless initialization failed:', error);
      throw error;
    } finally {
      initializationInProgress = false;
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/**
 * Vercel serverless handler
 * Express app is used directly since it's a valid (req, res) handler
 */
module.exports = async (req, res) => {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    logger.error('Request failed during initialization:', error.message);
    res.status(500).json({
      success: false,
      message: 'Service initialization failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
