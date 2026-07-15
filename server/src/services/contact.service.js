const CmsService = require('./cms.service');
const { CMS_SECTIONS } = require('../constants/cms');

class ContactService {
  constructor() {
    this.section = CMS_SECTIONS.CONTACT;
    this.identifier = 'default';
  }

  async getContact() {
    return CmsService.getBySection(this.section, this.identifier);
  }

  async getPublishedContact() {
    return CmsService.getPublishedBySection(this.section, this.identifier);
  }

  async upsertContact(data, userId) {
    return CmsService.upsertBySection(this.section, data, userId);
  }

  async publishContact(userId) {
    return CmsService.publishSection(this.section, this.identifier, userId);
  }

  async unpublishContact(userId) {
    return CmsService.unpublishSection(this.section, this.identifier, userId);
  }

  async softDeleteContact(id, userId) {
    return CmsService.softDeleteContent(id, userId);
  }

  async restoreContact(id, userId) {
    return CmsService.restoreContent(id, userId);
  }
}

module.exports = new ContactService();
