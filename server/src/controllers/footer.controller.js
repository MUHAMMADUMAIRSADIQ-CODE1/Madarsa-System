const { AuditService, FooterService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.getFooter();
  res.status(200).json(ApiResponse.success('Footer content fetched successfully', content));
});

const createFooter = asyncHandler(async (req, res) => {
  const data = { ...req.body, identifier: 'default' };
  const content = await FooterService.upsertFooter(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Created footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Footer content created successfully', content));
});

const updateFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.upsertFooter(req.body, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Updated footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Footer content updated successfully', content));
});

const deleteFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.softDeleteFooter(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Deleted footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Footer content deleted successfully', content));
});

const restoreFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.restoreFooter(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Restored footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Footer content restored successfully', content));
});

const publishFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.publishFooter(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Published footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Footer content published successfully', content));
});

const unpublishFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.unpublishFooter(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:footer',
    description: 'Unpublished footer content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Footer content unpublished successfully', content));
});

const getPublicFooter = asyncHandler(async (req, res) => {
  const content = await FooterService.getPublishedFooter();

  if (!content) {
    return res.status(200).json(ApiResponse.success('Footer content not available', null));
  }

  res.status(200).json(ApiResponse.success('Footer content fetched successfully', content.toPublicJSON()));
});

module.exports = {
  getFooter, createFooter, updateFooter, deleteFooter,
  restoreFooter, publishFooter, unpublishFooter, getPublicFooter,
};
