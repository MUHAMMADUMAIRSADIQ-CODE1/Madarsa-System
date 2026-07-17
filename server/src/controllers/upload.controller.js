const cloudinary = require('cloudinary').v2;
const { ApiResponse, asyncHandler, ApiError, logger } = require('../utils');
const { httpStatus } = require('../constants');

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `users/${req.user.id}`,
      resource_type: 'auto',
    });

    res.status(200).json(
      ApiResponse.success('File uploaded successfully', {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      })
    );
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'File upload failed');
  }
});

const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
  }

  try {
    const uploadPromises = req.files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `users/${req.user.id}`,
        resource_type: 'auto',
      })
    );

    const results = await Promise.all(uploadPromises);

    const files = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      format: r.format,
      size: r.bytes,
    }));

    res.status(200).json(
      ApiResponse.success('Files uploaded successfully', { files })
    );
  } catch (error) {
    logger.error('Cloudinary multiple upload failed:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'File upload failed');
  }
});

module.exports = {
  uploadFile,
  uploadMultipleFiles,
};
