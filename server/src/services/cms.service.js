const BaseService = require('./BaseService');
const CmsContent = require('../models/CmsContent.model');
const { ApiError, logger } = require('../utils');
const { httpStatus } = require('../constants');
const { CMS_SECTIONS } = require('../constants/cms');

class CmsService extends BaseService {
  constructor() {
    super(CmsContent, 'CMS content');
    this.searchFields = ['title', 'subtitle', 'description'];
  }

  async getBySection(section, identifier = 'default') {
    if (!Object.values(CMS_SECTIONS).includes(section)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid CMS section: ${section}`);
    }

    const content = await this.getOne({
      section,
      identifier,
      isDeleted: false,
    });

    return content;
  }

  async getPublishedBySection(section, identifier = 'default') {
    const content = await this.getOne({
      section,
      identifier,
      isDeleted: false,
      isActive: true,
      status: 'published',
    });

    return content;
  }

  async upsertBySection(section, data, userId) {
    if (!Object.values(CMS_SECTIONS).includes(section)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid CMS section: ${section}`);
    }

    const identifier = data.identifier || 'default';

    let existing = await this.getOne({
      section,
      identifier,
    });

    const updateData = {
      ...data,
      section,
      identifier,
      updatedBy: userId,
      $inc: existing ? { version: 1 } : undefined,
    };

    if (data.status === 'published') {
      updateData.publishedAt = new Date();
    }

    if (existing) {
      const updated = await this.model
        .findOneAndUpdate(
          { section, identifier },
          {
            $set: updateData,
            $setOnInsert: { createdBy: userId, version: 1 },
          },
          { new: true, upsert: true, runValidators: true }
        )
        .exec();

      return updated;
    }

    const created = await this.create({
      ...data,
      section,
      identifier,
      createdBy: userId,
      updatedBy: userId,
      version: 1,
    });

    return created;
  }

  async publishSection(section, identifier = 'default', userId) {
    const content = await this.getBySection(section, identifier);

    if (!content) {
      throw new ApiError(httpStatus.NOT_FOUND, `${section} content not found`);
    }

    content.status = 'published';
    content.publishedAt = new Date();
    content.updatedBy = userId;
    content.version += 1;

    await content.save();
    return content;
  }

  async unpublishSection(section, identifier = 'default', userId) {
    const content = await this.getBySection(section, identifier);

    if (!content) {
      throw new ApiError(httpStatus.NOT_FOUND, `${section} content not found`);
    }

    content.status = 'draft';
    content.updatedBy = userId;
    await content.save();
    return content;
  }

  async getAllSections() {
    const sections = await this.model
      .find({ isDeleted: false })
      .sort({ section: 1, order: 1 })
      .lean();

    const grouped = sections.reduce((acc, item) => {
      const section = item.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    }, {});

    return grouped;
  }

  async getSectionStats() {
    const stats = await this.model.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$section',
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
          },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = stats.reduce((sum, s) => sum + s.total, 0);
    const published = stats.reduce((sum, s) => sum + s.published, 0);

    return { total, published, bySection: stats };
  }

  async softDeleteContent(id, userId) {
    const content = await this.getById(id);

    content.isDeleted = true;
    content.deletedAt = new Date();
    content.isActive = false;
    content.updatedBy = userId;

    await content.save();
    return content;
  }

  async restoreContent(id, userId) {
    const content = await this.model.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!content) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Deleted content not found');
    }

    content.isDeleted = false;
    content.deletedAt = null;
    content.isActive = true;
    content.updatedBy = userId;

    await content.save();
    return content;
  }
}

module.exports = new CmsService();
