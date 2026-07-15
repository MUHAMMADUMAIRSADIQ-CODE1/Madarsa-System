const BaseService = require('./BaseService');
const Gallery = require('../models/Gallery.model');

class GalleryService extends BaseService {
  constructor() {
    super(Gallery, 'Gallery item');
    this.searchFields = ['title', 'description', 'category', 'tags'];
  }

  async getPublishedItems(query = {}, options = {}) {
    return this.getAll({ ...query, isPublished: true }, options);
  }

  async getByCategory(category) {
    return this.getAll({ category, isPublished: true });
  }

  async uploadImage(data, file) {
    const imageData = {
      ...data,
      imageUrl: file.path,
    };

    if (file.filename) {
      imageData.cloudinaryPublicId = file.filename;
    }

    return this.create(imageData);
  }

  async getGalleryStats() {
    const [totalItems, publishedItems, categoryDistribution] =
      await Promise.all([
        this.count(),
        this.count({ isPublished: true }),
        this.model.aggregate([
          { $match: { isPublished: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    return { totalItems, publishedItems, categoryDistribution };
  }
}

module.exports = new GalleryService();
