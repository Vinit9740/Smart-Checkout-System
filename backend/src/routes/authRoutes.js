const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');
const { authLimiter } = require('../middleware/rateLimiter');
const auditLogger = require('../middleware/auditLogger');

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  auditLogger('REGISTER', 'auth'),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  auditLogger('LOGIN', 'auth'),
  authController.login
);

module.exports = router;
