const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { validateParams } = require('../middleware/validate');
const { uuidParamSchema } = require('../utils/validationSchemas');
const auditLogger = require('../middleware/auditLogger');

router.post(
  '/start',
  authenticate,
  auditLogger('START_SESSION', 'session'),
  sessionController.startSession
);

router.get(
  '/:id',
  authenticate,
  validateParams(uuidParamSchema),
  sessionController.getSession
);

module.exports = router;
