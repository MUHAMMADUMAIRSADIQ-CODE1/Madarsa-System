const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const isVercel = process.env.VERCEL === '1';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // On Vercel, use the temp directory (ephemeral, but files get uploaded to Cloudinary)
    const uploadDir = isVercel
      ? '/tmp'
      : path.resolve(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (env.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `${messages.INVALID_FILE_TYPE}: ${file.mimetype}. Allowed types: ${env.upload.allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
});

const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount = 10) =>
  upload.array(fieldName, maxCount);

const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
};
