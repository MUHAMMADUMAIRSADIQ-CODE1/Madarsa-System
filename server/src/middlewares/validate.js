const { validationResult } = require('express-validator');
const { ApiError } = require('../utils');
const { httpStatus, messages } = require('../constants');

const validate = (validations) => {
  return async (req, _res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    const errorMessage = formattedErrors
      .map((e) => `${e.field}: ${e.message}`)
      .join(', ');

    next(
      new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        errorMessage,
        formattedErrors
      )
    );
  };
};

module.exports = validate;
