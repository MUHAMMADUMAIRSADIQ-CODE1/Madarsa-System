const cloudinary = require('cloudinary').v2;
const { CmsService, AuditService, HeroService } = require('../services');
const { ApiResponse, asyncHandler, helpers, logger } = require('../utils');
const { httpStatus } = require('../constants');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getHero = asyncHandler(async (req, res) => {
  const content = await HeroService.getHero();

  res.status(200).json(
    ApiResponse.success('Hero content fetched successfully', content)
  );
});

const createHero = asyncHandler(async (req, res) => {
  const data = { ...req.body, identifier: 'default' };

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'hero',
        resource_type: 'image',
      });
      data.images = [{
        url: result.secure_url,
        alt: req.body.imageAlt || 'Hero illustration',
        order: 0,
      }];
    } catch (uploadError) {
      logger.error('Cloudinary upload failed for hero image:', uploadError.message);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload hero image');
    }
  }

  const content = await HeroService.upsertHero(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Created hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(
    ApiResponse.created('Hero content created successfully', content)
  );
});

const updateHero = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'hero',
        resource_type: 'image',
      });
      data.images = [{
        url: result.secure_url,
        alt: req.body.imageAlt || 'Hero illustration',
        order: 0,
      }];
    } catch (uploadError) {
      logger.error('Cloudinary upload failed for hero image:', uploadError.message);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload hero image');
    }
  }

  const content = await HeroService.upsertHero(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Updated hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    ApiResponse.success('Hero content updated successfully', content)
  );
});

const deleteHero = asyncHandler(async (req, res) => {
  const content = await HeroService.softDeleteHero(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Deleted hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    ApiResponse.success('Hero content deleted successfully', content)
  );
});

const restoreHero = asyncHandler(async (req, res) => {
  const content = await HeroService.restoreHero(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Restored hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    ApiResponse.success('Hero content restored successfully', content)
  );
});

const publishHero = asyncHandler(async (req, res) => {
  const content = await HeroService.publishHero(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Published hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    ApiResponse.success('Hero content published successfully', content)
  );
});

const unpublishHero = asyncHandler(async (req, res) => {
  const content = await HeroService.unpublishHero(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:hero',
    description: 'Unpublished hero content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    ApiResponse.success('Hero content unpublished successfully', content)
  );
});

const getPublicHero = asyncHandler(async (req, res) => {
  const content = await HeroService.getPublishedHero();

  if (!content) {
    return res.status(200).json(
      ApiResponse.success('Hero content not available', null)
    );
  }

  res.status(200).json(
    ApiResponse.success('Hero content fetched successfully', content.toPublicJSON())
  );
});

module.exports = {
  getHero,
  createHero,
  updateHero,
  deleteHero,
  restoreHero,
  publishHero,
  unpublishHero,
  getPublicHero,
};
