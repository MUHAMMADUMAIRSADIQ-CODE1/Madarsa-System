const { ApiResponse, asyncHandler, helpers } = require('../utils');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  getAll = asyncHandler(async (req, res) => {
    const { page, limit, skip } = helpers.parsePagination(req.query);
    const sort = helpers.buildSortObject(req.query.sortBy, req.query.sortOrder);
    const populate = req.query.populate || '';
    const select = req.query.select || '';

    const query = this.buildFilterQuery(req);

    const result = await this.service.getAll(query, {
      page,
      limit,
      skip,
      sort,
      populate,
      select,
    });

    res.status(200).json(
      ApiResponse.success(
        `${this.service.resourceName}s fetched successfully`,
        result
      )
    );
  });

  getById = asyncHandler(async (req, res) => {
    const populate = req.query.populate || '';
    const select = req.query.select || '';

    const document = await this.service.getById(req.params.id, {
      populate,
      select,
    });

    res.status(200).json(
      ApiResponse.success(
        `${this.service.resourceName} fetched successfully`,
        document
      )
    );
  });

  create = asyncHandler(async (req, res) => {
    const document = await this.service.create(req.body);

    res.status(201).json(
      ApiResponse.created(
        `${this.service.resourceName} created successfully`,
        document
      )
    );
  });

  update = asyncHandler(async (req, res) => {
    const populate = req.query.populate || '';

    const document = await this.service.update(req.params.id, req.body, {
      populate,
    });

    res.status(200).json(
      ApiResponse.success(
        `${this.service.resourceName} updated successfully`,
        document
      )
    );
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);

    res.status(200).json(
      ApiResponse.success(
        `${this.service.resourceName} deleted successfully`
      )
    );
  });

  buildFilterQuery(req) {
    const query = { ...req.query };

    const excludedFields = [
      'page',
      'limit',
      'sortBy',
      'sortOrder',
      'populate',
      'select',
      'search',
    ];

    excludedFields.forEach((field) => delete query[field]);

    if (req.query.search) {
      query.search = req.query.search;
    }

    return query;
  }
}

module.exports = BaseController;
