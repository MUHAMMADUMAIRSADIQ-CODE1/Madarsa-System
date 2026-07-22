const winston = require('winston');
const path = require('path');
const env = require('../config/env');

const logDir = path.resolve(__dirname, '../../', env.log.dir);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

const isVercel = process.env.VERCEL === '1';

// Build transports array - file transports only when not on Vercel
const transports = [
  // Console transport is always available
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// File transports are not available on Vercel (ephemeral filesystem)
if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'jamia-api' },
  transports,
});

// Exception/rejection handlers - file-only, skip on Vercel
if (!isVercel) {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    })
  );
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    })
  );
}

module.exports = logger;
