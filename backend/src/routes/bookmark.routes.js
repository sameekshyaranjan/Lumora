const router = require('express').Router();
const svc = require('../services/engagement.service');
const auth = require('../middlewares/auth.middleware');
const { ok } = require('../utils/respond');
const bookmarkController = require('../controllers/bookmark.controller');

router.get('/', auth, async (req, res, next) => {
  try {
    const videos = await svc.listBookmarks(req.user.id);
    return ok(res, { videos }, 'OK');
  } catch (e) { next(e); }
});

router.get('/timestamps', auth, bookmarkController.getAllTimestampBookmarks);

module.exports = router;
