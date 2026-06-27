const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware); // All progress routes require authentication

router.get('/stats', progressController.getUserStats);
router.get('/:category', progressController.getProgress);
router.post('/:videoId', progressController.markCompleted);

module.exports = router;
