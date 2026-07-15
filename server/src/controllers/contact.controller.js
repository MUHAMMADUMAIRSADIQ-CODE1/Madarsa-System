const { AuditService, ContactService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

const getContact = asyncHandler(async (req, res) => {
  const content = await ContactService.getContact();
  res.status(200).json(ApiResponse.success('Contact content fetched successfully', content));
});

const createContact = asyncHandler(async (req, res) => {
  const data = { ...req.body, identifier: 'default' };
  const content = await ContactService.upsertContact(data, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.CREATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Created contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(ApiResponse.created('Contact content created successfully', content));
});

const updateContact = asyncHandler(async (req, res) => {
  const content = await ContactService.upsertContact(req.body, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UPDATE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Updated contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Contact content updated successfully', content));
});

const deleteContact = asyncHandler(async (req, res) => {
  const content = await ContactService.softDeleteContact(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.DELETE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Deleted contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Contact content deleted successfully', content));
});

const restoreContact = asyncHandler(async (req, res) => {
  const content = await ContactService.restoreContact(req.params.id, req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.RESTORE,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Restored contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Contact content restored successfully', content));
});

const publishContact = asyncHandler(async (req, res) => {
  const content = await ContactService.publishContact(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.PUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Published contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Contact content published successfully', content));
});

const unpublishContact = asyncHandler(async (req, res) => {
  const content = await ContactService.unpublishContact(req.user.id);

  await AuditService.log({
    user: req.user.id,
    action: CMS_AUDIT_ACTIONS.UNPUBLISH,
    module: CMS_MODULES.CMS,
    resourceId: content._id,
    resourceType: 'cms:contact',
    description: 'Unpublished contact content',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(ApiResponse.success('Contact content unpublished successfully', content));
});

const getPublicContact = asyncHandler(async (req, res) => {
  const content = await ContactService.getPublishedContact();

  if (!content) {
    return res.status(200).json(ApiResponse.success('Contact content not available', null));
  }

  res.status(200).json(ApiResponse.success('Contact content fetched successfully', content.toPublicJSON()));
});

module.exports = {
  getContact, createContact, updateContact, deleteContact,
  restoreContact, publishContact, unpublishContact, getPublicContact,
};
