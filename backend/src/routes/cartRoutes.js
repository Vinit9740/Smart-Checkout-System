const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validate');
const { addToCartSchema, removeFromCartSchema, sessionIdParamSchema } = require('../utils/validationSchemas');
const auditLogger = require('../middleware/auditLogger');

router.post(
  '/add',
  authenticate,
  validate(addToCartSchema),
  auditLogger('ADD_TO_CART', 'cart'),
  cartController.addItem
);

router.post(
  '/remove',
  authenticate,
  validate(removeFromCartSchema),
  auditLogger('REMOVE_FROM_CART', 'cart'),
  cartController.removeItem
);

router.post(
  '/delete',
  authenticate,
  validate(removeFromCartSchema),
  auditLogger('DELETE_FROM_CART', 'cart'),
  cartController.deleteItem
);

router.get(
  '/:sessionId',
  authenticate,
  validateParams(sessionIdParamSchema),
  cartController.getCart
);

module.exports = router;
