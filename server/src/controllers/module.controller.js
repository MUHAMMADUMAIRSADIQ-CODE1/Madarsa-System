const ModuleService = require('../services/module.service');
const { ApiResponse, asyncHandler } = require('../utils');

const getAll = asyncHandler(async (req, res) => {
  const result = await ModuleService.getByCourse(req.params.courseId, req.query);
  res.status(200).json(
    ApiResponse.success('Modules fetched successfully', result)
  );
});

const getById = asyncHandler(async (req, res) => {
  const module = await ModuleService.getById(req.params.id);
  res.status(200).json(
    ApiResponse.success('Module fetched successfully', module)
  );
});

const getPublished = asyncHandler(async (req, res) => {
  const result = await ModuleService.getPublishedByCourse(req.params.courseId);
  res.status(200).json(
    ApiResponse.success('Published modules fetched successfully', result)
  );
});

const create = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    course: req.body.course,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  };
  const module = await ModuleService.create(data);
  res.status(201).json(
    ApiResponse.created('Module created successfully', module)
  );
});

const update = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    updatedBy: req.user.id,
  };
  const module = await ModuleService.update(req.params.id, data);
  res.status(200).json(
    ApiResponse.success('Module updated successfully', module)
  );
});

const deleteModule = asyncHandler(async (req, res) => {
  const module = await ModuleService.softDelete(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Module deleted successfully', module)
  );
});

const reorder = asyncHandler(async (req, res) => {
  const result = await ModuleService.reorder(
    req.params.courseId,
    req.body.moduleIds,
    req.user.id
  );
  res.status(200).json(
    ApiResponse.success('Modules reordered successfully', result)
  );
});

const publish = asyncHandler(async (req, res) => {
  const module = await ModuleService.publish(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Module published successfully', module)
  );
});

const unpublish = asyncHandler(async (req, res) => {
  const module = await ModuleService.unpublish(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Module unpublished successfully', module)
  );
});

module.exports = {
  getAll,
  getById,
  getPublished,
  create,
  update,
  deleteModule,
  reorder,
  publish,
  unpublish,
};
