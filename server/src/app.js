const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { globalLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.nodeEnv === 'production') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (_req, res) => res.statusCode < 400,
  }));
} else {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

app.use(express.static(path.resolve(__dirname, '../public')));

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use(globalLimiter);

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
