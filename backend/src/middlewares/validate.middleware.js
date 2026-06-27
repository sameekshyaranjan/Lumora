const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array();
  const err = new ValidationError(errors[0].msg);
  err.details = errors.map((e) => ({ field: e.path, message: e.msg }));
  next(err);
}

module.exports = { validate };
