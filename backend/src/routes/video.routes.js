const router = require('express').Router();
const ctrl = require('../controllers/video.controller');
const engagement = require('../controllers/engagement.controller');
const auth = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createVideoRules, commentRules, idParamRule } = require('../utils/validators');
const { engagementLimiter } = require('../middlewares/rateLimit.middleware');
const quizController = require('../controllers/quiz.controller');
const bookmarkController = require('../controllers/bookmark.controller');

router.get('/', ctrl.list);
router.get('/:id', idParamRule, validate, ctrl.getOne);

router.post('/', auth, createVideoRules, validate, ctrl.create);

router.post('/:id/like', auth, engagementLimiter, idParamRule, validate, engagement.like);
router.delete('/:id/like', auth, engagementLimiter, idParamRule, validate, engagement.unlike);
router.post('/:id/bookmark', auth, engagementLimiter, idParamRule, validate, engagement.bookmark);
router.delete('/:id/bookmark', auth, engagementLimiter, idParamRule, validate, engagement.unbookmark);
router.post('/:id/comment', auth, engagementLimiter, commentRules, validate, engagement.comment);
router.get('/:id/comments', idParamRule, validate, engagement.listComments);

router.get('/:videoId/quiz', quizController.getQuiz);
router.post('/:videoId/quiz/submit', auth, quizController.submitQuiz);

router.post('/:videoId/timestamps', auth, bookmarkController.addTimestampBookmark);
router.get('/:videoId/timestamps', auth, bookmarkController.getTimestampBookmarks);

module.exports = router;
