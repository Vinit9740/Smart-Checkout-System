const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one digit'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const addToCartSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  barcode: Joi.string().min(1).max(100).trim().required(),
});

const removeFromCartSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  productId: Joi.string().min(1).max(100).required(), // product IDs may be 'prod-X' format, not UUIDs
});

const paymentSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  method: Joi.string().valid('simulate', 'upi', 'card', 'wallet').default('simulate'),
});

const exitVerifySchema = Joi.object({
  qrToken: Joi.string().min(1).required(),
});

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const barcodeParamSchema = Joi.object({
  code: Joi.string().min(1).max(100).required(),
});

const sessionIdParamSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  addToCartSchema,
  removeFromCartSchema,
  paymentSchema,
  exitVerifySchema,
  uuidParamSchema,
  barcodeParamSchema,
  sessionIdParamSchema,
};
