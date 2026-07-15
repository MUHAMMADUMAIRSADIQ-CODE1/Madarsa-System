const CmsService = require('./cms.service');
const { CMS_SECTIONS } = require('../constants/cms');

class AboutService {
  constructor() {
    this.section = CMS_SECTIONS.ABOUT;
    this.identifier = 'default';
  }

  async getAbout() {
    return CmsService.getBySection(this.section, this.identifier);
  }

  async getPublishedAbout() {
    return CmsService.getPublishedBySection(this.section, this.identifier);
  }

  async upsertAbout(data, userId) {
    return CmsService.upsertBySection(this.section, data, userId);
  }

  async publishAbout(userId) {
    return CmsService.publishSection(this.section, this.identifier, userId);
  }

  async unpublishAbout(userId) {
    return CmsService.unpublishSection(this.section, this.identifier, userId);
  }

  async softDeleteAbout(id, userId) {
    return CmsService.softDeleteContent(id, userId);
  }

  async restoreAbout(id, userId) {
    return CmsService.restoreContent(id, userId);
  }
}

module.exports = new AboutService();
