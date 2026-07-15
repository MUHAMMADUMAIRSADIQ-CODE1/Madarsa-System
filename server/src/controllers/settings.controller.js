const { AuditService, SettingsService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.getSettings();
  res.status(200).json(ApiResponse.success('Settings fetched successfully', content));
});

const createSettings = asyncHandler(async (req, res) => {
  const data = { ...req.body, identifier: 'default' };

  if (req.file) {
    data.images = [{
      url: `/uploads/${req.file.filename}`,
      alt: req.body.imageAlt || 'Settings image',
      order: 0,
    }];
  }

  const content = await SettingsService.upsertSettings(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Created website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Settings created successfully', content));
});

const updateSettings = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (req.file) {
    data.images = [{
      url: `/uploads/${req.file.filename}`,
      alt: req.body.imageAlt || 'Settings image',
      order: 0,
    }];
  }

  const content = await SettingsService.upsertSettings(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Updated website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Settings updated successfully', content));
});

const deleteSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.softDeleteSettings(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Deleted website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Settings deleted successfully', content));
});

const restoreSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.restoreSettings(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Restored website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Settings restored successfully', content));
});

const publishSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.publishSettings(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Published website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Settings published successfully', content));
});

const unpublishSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.unpublishSettings(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:settings',
    description: 'Unpublished website settings',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Settings unpublished successfully', content));
});

const getPublicSettings = asyncHandler(async (req, res) => {
  const content = await SettingsService.getPublishedSettings();

  if (!content) {
    return res.status(200).json(ApiResponse.success('Settings not available', null));
  }

  res.status(200).json(ApiResponse.success('Settings fetched successfully', content.toPublicJSON()));
});

module.exports = {
  getSettings, createSettings, updateSettings, deleteSettings,
  restoreSettings, publishSettings, unpublishSettings, getPublicSettings,
};
