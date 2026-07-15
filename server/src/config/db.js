const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
};

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectDB() {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  try {
    const conn = await mongoose.connect(env.mongodb.uri, connectionOptions);

    isConnected = true;
    retryCount = 0;

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
      isConnected = false;
      handleReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error.message);
    isConnected = false;
    await handleReconnect();
  }
}

async function handleReconnect() {
  if (retryCount >= MAX_RETRIES) {
    logger.error(`MongoDB reconnection failed after ${MAX_RETRIES} attempts. Exiting.`);
    process.exit(1);
  }

  retryCount += 1;
  logger.info(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`);
  await sleep(RETRY_DELAY_MS);
  return connectDB();
}

async function disconnectDB() {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error.message);
  }
}

function getConnectionStatus() {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

module.exports = { connectDB, disconnectDB, getConnectionStatus };
