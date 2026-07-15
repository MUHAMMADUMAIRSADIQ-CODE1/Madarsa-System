const { connectDB, disconnectDB, getConnectionStatus } = require('../config/db');

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
};
