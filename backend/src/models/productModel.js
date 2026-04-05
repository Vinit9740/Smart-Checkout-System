const db = require('../config/db');

const productModel = {
  async findAll(limit = 50, offset = 0) {
    const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  },

  async findByBarcode(barcode) {
    const { rows } = await db.query('SELECT * FROM products WHERE barcode = ?', [barcode]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },
};

module.exports = productModel;
