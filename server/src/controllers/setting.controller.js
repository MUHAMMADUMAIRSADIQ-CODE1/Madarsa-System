const BaseController = require('./BaseController');
const { SettingService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');
const { messages } = require('../constants');

class SettingController extends BaseController {
  constructor() {
    super(SettingService);
  }

  getPublic = asyncHandler(async (_req, res) => {
    const settings = await this.service.getPublicSettings();
    res.status(200).json(
      ApiResponse.success('Public settings fetched successfully', settings)
    );
  });

  getByKey = asyncHandler(async (req, res) => {
    const value = await this.service.getByKey(req.params.key);
    res.status(200).json(
      ApiResponse.success('Setting fetched successfully', { key: req.params.key, value })
    );
  });

  updateByKey = asyncHandler(async (req, res) => {
    const { value, ...options } = req.body;
    const setting = await this.service.setByKey(req.params.key, value, {
      ...options,
      updatedBy: req.user?.id,
    });
    res.status(200).json(
      ApiResponse.success(messages.SETTINGS_UPDATED, setting)
    );
  });

  getGroup = asyncHandler(async (req, res) => {
    const settings = await this.service.getGroup(req.params.group);
    res.status(200).json(
      ApiResponse.success('Settings group fetched successfully', settings)
    );
  });

  updateBulk = asyncHandler(async (req, res) => {
    const settings = await this.service.updateBulk(
      req.body.settings,
      req.user?.id
    );
    res.status(200).json(
      ApiResponse.success('Settings updated successfully', settings)
    );
  });
}

module.exports = new SettingController();
