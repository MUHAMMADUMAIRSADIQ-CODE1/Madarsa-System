const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const { initializeCloudinary } = require('./config/cloudinary');
const logger = require('./utils/logger');

let server;

async function initializeServer() {
  try {
    await connectDB();

    try {
      initializeFirebase();
    } catch (firebaseError) {
      logger.warn('Firebase initialization skipped:', firebaseError.message);
    }

    try {
      initializeCloudinary();
    } catch (cloudinaryError) {
      logger.warn('Cloudinary initialization skipped:', cloudinaryError.message);
    }

    server = app.listen(env.port, () => {
      logger.info(`
      ==============================================
        Jamia Tul Uloom Muhammadiya API Server
      ==============================================
        Environment : ${env.nodeEnv}
        Port        : ${env.port}
        Frontend    : ${env.frontendUrl}
        API Base    : http://localhost:${env.port}/api/v1
        Health      : http://localhost:${env.port}/api/v1/health
        Started At  : ${new Date().toISOString()}
      ==============================================
      `);
    });

    server.timeout = 120000;

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown();
    });

  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  logger.info('Initiating graceful shutdown...');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await disconnectDB();
        logger.info('Database connections closed');
      } catch (err) {
        logger.error('Error closing database:', err);
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
}

initializeServer();

module.exports = app;
