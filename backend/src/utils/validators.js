const { body, param } = require('express-validator');

const registerRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be 8+ chars'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createVideoRules = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('file_path').trim().notEmpty().withMessage('file_path required'),
  body('description').optional().isString(),
];

const commentRules = [
  param('id').isUUID().withMessage('Invalid video id'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment 1–1000 chars'),
];

const idParamRule = [param('id').isUUID().withMessage('Invalid video id')];

module.exports = {
  registerRules, loginRules, createVideoRules, commentRules, idParamRule,
};
