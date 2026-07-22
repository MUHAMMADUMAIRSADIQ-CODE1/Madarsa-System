const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envFile = process.env.NODE_ENV === 'test'
  ? '.env.test'
  : '.env';

const envPath = path.resolve(__dirname, '../../', envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar] || process.env[envVar].trim() === ''
);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  console.error('Please copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// On Vercel, env vars are injected by the platform
if (process.env.VERCEL === '1') {
  console.log('Running on Vercel - environment variables provided by platform');
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'jamia-tul-uloom-muhammadiya',
  },

  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@jamiatululoom.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Jamia Tul Uloom Muhammadiya',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
  },

  log: {
    level: process.env.LOG_LEVEL || 'dev',
    dir: process.env.LOG_DIR || 'logs',
  },
};

Object.freeze(env);

module.exports = env;
