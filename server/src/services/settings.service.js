const CmsService = require('./cms.service');
const { CMS_SECTIONS } = require('../constants/cms');

class SettingsService {
  constructor() {
    this.section = CMS_SECTIONS.SETTINGS;
    this.identifier = 'default';
  }

  async getSettings() {
    return CmsService.getBySection(this.section, this.identifier);
  }

  async getPublishedSettings() {
    return CmsService.getPublishedBySection(this.section, this.identifier);
  }

  async upsertSettings(data, userId) {
    return CmsService.upsertBySection(this.section, data, userId);
  }

  async publishSettings(userId) {
    return CmsService.publishSection(this.section, this.identifier, userId);
  }

  async unpublishSettings(userId) {
    return CmsService.unpublishSection(this.section, this.identifier, userId);
  }

  async softDeleteSettings(id, userId) {
    return CmsService.softDeleteContent(id, userId);
  }

  async restoreSettings(id, userId) {
    return CmsService.restoreContent(id, userId);
  }
}

module.exports = new SettingsService();
