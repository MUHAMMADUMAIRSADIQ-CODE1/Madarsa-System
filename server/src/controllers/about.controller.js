const { AuditService, AboutService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.getAbout();
  res.status(200).json(ApiResponse.success('About content fetched successfully', content));
});

const createAbout = asyncHandler(async (req, res) => {
  const data = { ...req.body, identifier: 'default' };

  if (req.file) {
    data.images = [{
      url: `/uploads/${req.file.filename}`,
      alt: req.body.imageAlt || 'About image',
      order: 0,
    }];
  }

  const content = await AboutService.upsertAbout(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Created about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('About content created successfully', content));
});

const updateAbout = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    data.images = [{
      url: `/uploads/${req.file.filename}`,
      alt: req.body.imageAlt || 'About image',
      order: 0,
    }];
  }

  const content = await AboutService.upsertAbout(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Updated about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('About content updated successfully', content));
});

const deleteAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.softDeleteAbout(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Deleted about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('About content deleted successfully', content));
});

const restoreAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.restoreAbout(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Restored about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('About content restored successfully', content));
});

const publishAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.publishAbout(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Published about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('About content published successfully', content));
});

const unpublishAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.unpublishAbout(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:about',
    description: 'Unpublished about content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('About content unpublished successfully', content));
});

const getPublicAbout = asyncHandler(async (req, res) => {
  const content = await AboutService.getPublishedAbout();

  if (!content) {
    return res.status(200).json(ApiResponse.success('About content not available', null));
  }

  res.status(200).json(ApiResponse.success('About content fetched successfully', content.toPublicJSON()));
});

module.exports = {
  getAbout, createAbout, updateAbout, deleteAbout,
  restoreAbout, publishAbout, unpublishAbout, getPublicAbout,
};
