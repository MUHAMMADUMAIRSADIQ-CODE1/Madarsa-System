const BaseController = require('./BaseController');
const { GalleryService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');

class GalleryController extends BaseController {
  constructor() {
    super(GalleryService);
  }

  getPublished = asyncHandler(async (req, res) => {
    const result = await this.service.getPublishedItems({
      category: req.query.category,
    });
    res.status(200).json(
      ApiResponse.success('Gallery items fetched successfully', result)
    );
  });

  getByCategory = asyncHandler(async (req, res) => {
    const items = await this.service.getByCategory(req.params.category);
    res.status(200).json(
      ApiResponse.success('Gallery items by category fetched successfully', items)
    );
  });

  upload = asyncHandler(async (req, res) => {
    const item = await this.service.uploadImage(req.body, req.file);
    res.status(201).json(
      ApiResponse.created('Image uploaded successfully', item)
    );
  });

  getStats = asyncHandler(async (_req, res) => {
    const stats = await this.service.getGalleryStats();
    res.status(200).json(
      ApiResponse.success('Gallery stats fetched successfully', stats)
    );
  });
}

module.exports = new GalleryController();
