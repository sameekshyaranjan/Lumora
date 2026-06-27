class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
  }
}
class ValidationError extends AppError { constructor(m = 'Validation failed') { super(m, 400); } }
class AuthError       extends AppError { constructor(m = 'Unauthorized')      { super(m, 401); } }
class ForbiddenError  extends AppError { constructor(m = 'Forbidden')         { super(m, 403); } }
class NotFoundError   extends AppError { constructor(m = 'Not found')         { super(m, 404); } }
class ConflictError   extends AppError { constructor(m = 'Conflict')          { super(m, 409); } }

module.exports = {
  AppError, ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError,
};
