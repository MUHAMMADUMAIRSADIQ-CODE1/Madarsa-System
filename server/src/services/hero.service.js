const CmsService = require('./cms.service');
const { CMS_SECTIONS } = require('../constants/cms');
const { httpStatus } = require('../constants');
const { ApiError } = require('../utils');

class HeroService {
  constructor() {
    this.section = CMS_SECTIONS.HERO;
    this.identifier = 'default';
  }

  async getHero() {
    return CmsService.getBySection(this.section, this.identifier);
  }

  async getPublishedHero() {
    return CmsService.getPublishedBySection(this.section, this.identifier);
  }

  async upsertHero(data, userId) {
    return CmsService.upsertBySection(this.section, data, userId);
  }

  async publishHero(userId) {
    return CmsService.publishSection(this.section, this.identifier, userId);
  }

  async unpublishHero(userId) {
    return CmsService.unpublishSection(this.section, this.identifier, userId);
  }

  async softDeleteHero(id, userId) {
    return CmsService.softDeleteContent(id, userId);
  }

  async restoreHero(id, userId) {
    return CmsService.restoreContent(id, userId);
  }

  async getHeroById(id) {
    return CmsService.getById(id, 'hero');
  }
}

module.exports = new HeroService();
