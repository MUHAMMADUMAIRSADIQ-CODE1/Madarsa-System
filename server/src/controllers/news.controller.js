const BaseController = require('./BaseController');
const { NewsService } = require('../services');
const { ApiResponse, asyncHandler } = require('../utils');

class NewsController extends BaseController {
  constructor() {
    super(NewsService);
  }

  getPublished = asyncHandler(async (req, res) => {
    const result = await this.service.getPublished({
      category: req.query.category,
    });
    res.status(200).json(
      ApiResponse.success('Published articles fetched successfully', result)
    );
  });

  getFeatured = asyncHandler(async (_req, res) => {
    const result = await this.service.getFeatured();
    res.status(200).json(
      ApiResponse.success('Featured articles fetched successfully', result.data)
    );
  });

  getBySlug = asyncHandler(async (req, res) => {
    const article = await this.service.getOne({ slug: req.params.slug, isPublished: true });
    if (article) {
      await this.service.incrementViewCount(article._id);
    }
    res.status(200).json(
      ApiResponse.success('Article fetched successfully', article)
    );
  });

  getStats = asyncHandler(async (_req, res) => {
    const stats = await this.service.getNewsStats();
    res.status(200).json(
      ApiResponse.success('News stats fetched successfully', stats)
    );
  });
}

module.exports = new NewsController();
