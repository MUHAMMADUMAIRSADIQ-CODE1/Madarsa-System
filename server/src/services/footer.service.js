const CmsService = require('./cms.service');
const { CMS_SECTIONS } = require('../constants/cms');

class FooterService {
  constructor() {
    this.section = CMS_SECTIONS.FOOTER;
    this.identifier = 'default';
  }

  async getFooter() {
    return CmsService.getBySection(this.section, this.identifier);
  }

  async getPublishedFooter() {
    return CmsService.getPublishedBySection(this.section, this.identifier);
  }

  async upsertFooter(data, userId) {
    return CmsService.upsertBySection(this.section, data, userId);
  }

  async publishFooter(userId) {
    return CmsService.publishSection(this.section, this.identifier, userId);
  }

  async unpublishFooter(userId) {
    return CmsService.unpublishSection(this.section, this.identifier, userId);
  }

  async softDeleteFooter(id, userId) {
    return CmsService.softDeleteContent(id, userId);
  }

  async restoreFooter(id, userId) {
    return CmsService.restoreContent(id, userId);
  }
}

module.exports = new FooterService();
