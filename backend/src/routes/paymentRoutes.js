const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paymentSchema } = require('../utils/validationSchemas');
const auditLogger = require('../middleware/auditLogger');

router.post(
  '/pay',
  authenticate,
  validate(paymentSchema),
  auditLogger('PAYMENT', 'payment'),
  paymentController.pay
);

router.get(
  '/history',
  authenticate,
  paymentController.getHistory
);

module.exports = router;
