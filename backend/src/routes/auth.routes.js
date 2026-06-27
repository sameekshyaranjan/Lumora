const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerRules, loginRules } = require('../utils/validators');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/register', registerRules, validate, ctrl.register);
router.post('/login', authLimiter, loginRules, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', auth, ctrl.me);

module.exports = router;
