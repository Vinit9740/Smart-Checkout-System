const productModel = require('../models/productModel');
const AppError = require('../utils/AppError');

const productController = {
  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const offset = parseInt(req.query.offset, 10) || 0;
      const products = await productModel.findAll(limit, offset);

      res.json({
        success: true,
        data: { products, count: products.length },
      });
    } catch (err) {
      next(err);
    }
  },

  async getByBarcode(req, res, next) {
    try {
      const product = await productModel.findByBarcode(req.params.code);

      if (!product) {
        return next(new AppError('Product not found for this barcode.', 404));
      }

      res.json({
        success: true,
        data: { product },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productController;
