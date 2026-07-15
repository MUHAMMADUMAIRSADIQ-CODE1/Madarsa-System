const BaseService = require('./BaseService');
const News = require('../models/News.model');
const { slugify } = require('../utils/helpers');

class NewsService extends BaseService {
  constructor() {
    super(News, 'News article');
    this.searchFields = ['title', 'content', 'excerpt', 'category', 'tags'];
  }

  async create(data) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }

    const existingNews = await this.getOne({ slug: data.slug });
    if (existingNews) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    return super.create(data);
  }

  async update(id, data) {
    if (data.isPublished && !data.publishedAt) {
      data.publishedAt = new Date();
    }
    return super.update(id, data);
  }

  async getPublished(query = {}, options = {}) {
    return this.getAll(
      { ...query, isPublished: true },
      { ...options, sort: { publishedAt: -1, ...options.sort } }
    );
  }

  async getFeatured() {
    return this.getAll(
      { isPublished: true, isFeatured: true },
      { limit: 5, sort: { publishedAt: -1 } }
    );
  }

  async incrementViewCount(newsId) {
    return this.model.findByIdAndUpdate(newsId, { $inc: { viewCount: 1 } });
  }

  async getNewsStats() {
    const [totalArticles, publishedArticles, featuredArticles] =
      await Promise.all([
        this.count(),
        this.count({ isPublished: true }),
        this.count({ isPublished: true, isFeatured: true }),
      ]);

    return { totalArticles, publishedArticles, featuredArticles };
  }
}

module.exports = new NewsService();
