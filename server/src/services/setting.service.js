const BaseService = require('./BaseService');
const Setting = require('../models/Setting.model');

class SettingService extends BaseService {
  constructor() {
    super(Setting, 'Setting');
  }

  async getByKey(key, defaultValue = null) {
    return Setting.get(key, defaultValue);
  }

  async setByKey(key, value, options = {}) {
    return Setting.set(key, value, options);
  }

  async getGroup(group) {
    return Setting.getGroup(group);
  }

  async getPublicSettings() {
    return this.getAll({ isPublic: true });
  }

  async updateBulk(settingsArray, updatedBy = null) {
    const results = [];
    for (const { key, value, ...options } of settingsArray) {
      const setting = await Setting.set(key, value, {
        ...options,
        updatedBy,
      });
      results.push(setting);
    }
    return results;
  }
}

module.exports = new SettingService();
