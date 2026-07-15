const BaseController = require('./BaseController');
const { CmsService, AuditService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { CMS_SECTIONS, CMS_AUDIT_ACTIONS, CMS_MODULES } = require('../constants/cms');

class CmsController extends BaseController {
  constructor() {
    super(CmsService);
  }

  getBySection = asyncHandler(async (req, res) => {
    const { section } = req.params;
    const identifier = req.query.identifier || 'default';

    const content = await this.service.getBySection(section, identifier);

    if (!content) {
      return res.status(200).json(
        ApiResponse.success(`${section} content fetched successfully`, null)
      );
    }

    res.status(200).json(
      ApiResponse.success(`${section} content fetched successfully`, content)
    );
  });

  getPublished = asyncHandler(async (req, res) => {
    const { section } = req.params;
    const identifier = req.query.identifier || 'default';

    const content = await this.service.getPublishedBySection(section, identifier);

    if (!content) {
      return res.status(200).json(
        ApiResponse.success(`${section} content fetched successfully`, null)
      );
    }

    res.status(200).json(
      ApiResponse.success(`${section} content fetched successfully`, content)
    );
  });

  upsertBySection = asyncHandler(async (req, res) => {
    const { section } = req.params;

    const content = await this.service.upsertBySection(section, req.body, req.user.id);

    await AuditService.log({
      user: req.user.id,
      action: CMS_AUDIT_ACTIONS.UPDATE,
      module: CMS_MODULES.CMS,
      resourceId: content._id,
      resourceType: `cms:${section}`,
      description: `Updated ${section} content`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
      ApiResponse.success(`${section} content updated successfully`, content)
    );
  });

  publish = asyncHandler(async (req, res) => {
    const { section } = req.params;
    const identifier = req.query.identifier || 'default';

    const content = await this.service.publishSection(section, identifier, req.user.id);

    await AuditService.log({
      user: req.user.id,
      action: CMS_AUDIT_ACTIONS.PUBLISH,
      module: CMS_MODULES.CMS,
      resourceId: content._id,
      resourceType: `cms:${section}`,
      description: `Published ${section} content`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
      ApiResponse.success(`${section} content published successfully`, content)
    );
  });

  unpublish = asyncHandler(async (req, res) => {
    const { section } = req.params;
    const identifier = req.query.identifier || 'default';

    const content = await this.service.unpublishSection(section, identifier, req.user.id);

    await AuditService.log({
      user: req.user.id,
      action: CMS_AUDIT_ACTIONS.UNPUBLISH,
      module: CMS_MODULES.CMS,
      resourceId: content._id,
      resourceType: `cms:${section}`,
      description: `Unpublished ${section} content`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
      ApiResponse.success(`${section} content unpublished successfully`, content)
    );
  });

  getAllSections = asyncHandler(async (_req, res) => {
    const grouped = await this.service.getAllSections();

    res.status(200).json(
      ApiResponse.success('All CMS sections fetched successfully', grouped)
    );
  });

  getStats = asyncHandler(async (_req, res) => {
    const stats = await this.service.getSectionStats();

    res.status(200).json(
      ApiResponse.success('CMS stats fetched successfully', stats)
    );
  });

  softDelete = asyncHandler(async (req, res) => {
    const content = await this.service.softDeleteContent(req.params.id, req.user.id);

    await AuditService.log({
      user: req.user.id,
      action: CMS_AUDIT_ACTIONS.DELETE,
      module: CMS_MODULES.CMS,
      resourceId: content._id,
      resourceType: `cms:${content.section}`,
      description: `Deleted ${content.section} content`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
      ApiResponse.success('Content deleted successfully', content)
    );
  });

  restore = asyncHandler(async (req, res) => {
    const content = await this.service.restoreContent(req.params.id, req.user.id);

    await AuditService.log({
      user: req.user.id,
      action: CMS_AUDIT_ACTIONS.RESTORE,
      module: CMS_MODULES.CMS,
      resourceId: content._id,
      resourceType: `cms:${content.section}`,
      description: `Restored ${content.section} content`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json(
      ApiResponse.success('Content restored successfully', content)
    );
  });
}

module.exports = new CmsController();
