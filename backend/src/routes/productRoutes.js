const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { validateParams } = require('../middleware/validate');
const { barcodeParamSchema } = require('../utils/validationSchemas');

router.get('/', authenticate, productController.getAll);
router.get('/barcode/:code', authenticate, validateParams(barcodeParamSchema), productController.getByBarcode);

module.exports = router;
