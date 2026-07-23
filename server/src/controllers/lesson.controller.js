const LessonService = require('../services/lesson.service');
const { ApiResponse, asyncHandler } = require('../utils');

const getAll = asyncHandler(async (req, res) => {
  const result = await LessonService.getByModule(req.params.moduleId, req.query);
  res.status(200).json(
    ApiResponse.success('Lessons fetched successfully', result)
  );
});

const getById = asyncHandler(async (req, res) => {
  const lesson = await LessonService.getById(req.params.id);
  res.status(200).json(
    ApiResponse.success('Lesson fetched successfully', lesson)
  );
});

const getPublished = asyncHandler(async (req, res) => {
  const result = await LessonService.getPublishedByModule(req.params.moduleId);
  res.status(200).json(
    ApiResponse.success('Published lessons fetched successfully', result)
  );
});

const create = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    module: req.body.module,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  };
  const lesson = await LessonService.create(data);
  res.status(201).json(
    ApiResponse.created('Lesson created successfully', lesson)
  );
});

const update = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    updatedBy: req.user.id,
  };
  const lesson = await LessonService.update(req.params.id, data);
  res.status(200).json(
    ApiResponse.success('Lesson updated successfully', lesson)
  );
});

const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await LessonService.softDelete(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Lesson deleted successfully', lesson)
  );
});

const reorder = asyncHandler(async (req, res) => {
  const result = await LessonService.reorder(
    req.params.moduleId,
    req.body.lessonIds,
    req.user.id
  );
  res.status(200).json(
    ApiResponse.success('Lessons reordered successfully', result)
  );
});

const publish = asyncHandler(async (req, res) => {
  const lesson = await LessonService.publish(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Lesson published successfully', lesson)
  );
});

const unpublish = asyncHandler(async (req, res) => {
  const lesson = await LessonService.unpublish(req.params.id, req.user.id);
  res.status(200).json(
    ApiResponse.success('Lesson unpublished successfully', lesson)
  );
});

module.exports = {
  getAll,
  getById,
  getPublished,
  create,
  update,
  deleteLesson,
  reorder,
  publish,
  unpublish,
};
