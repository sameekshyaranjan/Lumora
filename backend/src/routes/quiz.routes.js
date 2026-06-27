const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :videoId from parent router
const quizController = require('../controllers/quiz.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', quizController.getQuiz);
router.post('/submit', authMiddleware, quizController.submitQuiz);

module.exports = router;
