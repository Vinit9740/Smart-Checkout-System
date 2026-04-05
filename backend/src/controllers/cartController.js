const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const sessionModel = require('../models/sessionModel');
const fraudService = require('../services/fraudService');
const AppError = require('../utils/AppError');

const cartController = {
  async addItem(req, res, next) {
    try {
      const { sessionId, barcode } = req.body;

      // Verify session exists and belongs to user
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        return next(new AppError('Session not found.', 404));
      }
      if (session.user_id !== req.user.id) {
        return next(new AppError('Access denied.', 403));
      }
      if (session.status !== 'active') {
        return next(new AppError('This session is no longer active.', 400));
      }

      // Find product by barcode
      const product = await productModel.findByBarcode(barcode);
      if (!product) {
        return next(new AppError('Product not found for this barcode.', 404));
      }

      // Add to cart
      const cartItem = await cartModel.addItem(sessionId, product.id, product.price);

      // Run fraud check (non-blocking in terms of response, but we still await)
      const fraudResult = await fraudService.analyzeSession(sessionId, req.user.id);

      // Get updated cart total
      const cartTotal = await cartModel.getCartTotal(sessionId);

      res.status(201).json({
        success: true,
        message: `${product.name} added to cart.`,
        data: {
          cartItem,
          product: { id: product.id, name: product.name, price: product.price },
          cartTotal,
          fraud: fraudResult.flags.length > 0 ? { riskScore: fraudResult.riskScore } : undefined,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req, res, next) {
    try {
      const { sessionId, productId } = req.body;

      // Verify session
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        return next(new AppError('Session not found.', 404));
      }
      if (session.user_id !== req.user.id) {
        return next(new AppError('Access denied.', 403));
      }
      if (session.status !== 'active') {
        return next(new AppError('This session is no longer active.', 400));
      }

      const result = await cartModel.removeItem(sessionId, productId);
      if (!result) {
        return next(new AppError('Item not found in cart.', 404));
      }

      const cartTotal = await cartModel.getCartTotal(sessionId);

      res.json({
        success: true,
        message: 'Item quantity decreased.',
        data: { cartTotal },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteItem(req, res, next) {
    try {
      const { sessionId, productId } = req.body;

      // Verify session
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        return next(new AppError('Session not found.', 404));
      }
      if (session.user_id !== req.user.id) {
        return next(new AppError('Access denied.', 403));
      }
      if (session.status !== 'active') {
        return next(new AppError('This session is no longer active.', 400));
      }

      // Delete entire row regardless of quantity
      const { rows: existing } = await require('../config/db').query(
        'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?',
        [sessionId, productId]
      );
      if (!existing[0]) {
        return next(new AppError('Item not found in cart.', 404));
      }
      await require('../config/db').query(
        'DELETE FROM cart_items WHERE session_id = ? AND product_id = ?',
        [sessionId, productId]
      );

      const cartTotal = await cartModel.getCartTotal(sessionId);

      res.json({
        success: true,
        message: 'Item removed from cart.',
        data: { cartTotal },
      });
    } catch (err) {
      next(err);
    }
  },

  async getCart(req, res, next) {
    try {
      const { sessionId } = req.params;

      // Verify session
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        return next(new AppError('Session not found.', 404));
      }
      if (session.user_id !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
      }

      const items = await cartModel.getBySessionId(sessionId);
      const cartTotal = await cartModel.getCartTotal(sessionId);

      res.json({
        success: true,
        data: { items, cartTotal, itemCount: items.length },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cartController;
