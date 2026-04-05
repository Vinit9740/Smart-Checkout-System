const express = require('express');
const router = express.Router();
const exitController = require('../controllers/exitController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { exitVerifySchema } = require('../utils/validationSchemas');
const auditLogger = require('../middleware/auditLogger');

router.post(
  '/verify',
  authenticate,
  validate(exitVerifySchema),
  auditLogger('EXIT_VERIFY', 'exit'),
  exitController.verify
);

module.exports = router;
