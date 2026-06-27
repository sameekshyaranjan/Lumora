const router = require('express').Router();
const ctrl = require('../controllers/video.controller');
const engagement = require('../controllers/engagement.controller'); // Stage 6
const auth = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createVideoRules, commentRules, idParamRule } = require('../utils/validators');
const { engagementLimiter } = require('../middlewares/rateLimit.middleware');

router.get('/', ctrl.list);
router.get('/:id', idParamRule, validate, ctrl.getOne);

router.post('/', auth, createVideoRules, validate, ctrl.create);

router.post('/:id/like', auth, engagementLimiter, idParamRule, validate, engagement.like);
router.delete('/:id/like', auth, engagementLimiter, idParamRule, validate, engagement.unlike);
router.post('/:id/bookmark', auth, engagementLimiter, idParamRule, validate, engagement.bookmark);
router.delete('/:id/bookmark', auth, engagementLimiter, idParamRule, validate, engagement.unbookmark);
router.post('/:id/comment', auth, engagementLimiter, commentRules, validate, engagement.comment);
router.get('/:id/comments', idParamRule, validate, engagement.listComments);

module.exports = router;
