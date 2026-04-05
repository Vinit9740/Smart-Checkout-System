const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const cartModel = {
  async addItem(sessionId, productId, priceAtScan) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO cart_items (id, session_id, product_id, price_at_scan, quantity)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE quantity = quantity + 1, scanned_at = NOW()`,
      [id, sessionId, productId, priceAtScan]
    );
    const { rows } = await db.query('SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?', [sessionId, productId]);
    return rows[0];
  },

  async removeItem(sessionId, productId) {
    const { rows: existing } = await db.query(
      'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?',
      [sessionId, productId]
    );
    if (!existing[0]) return null;

    if (existing[0].quantity <= 1) {
      await db.query('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?', [sessionId, productId]);
      return { removed: true };
    }

    await db.query('UPDATE cart_items SET quantity = quantity - 1 WHERE session_id = ? AND product_id = ?', [sessionId, productId]);
    const { rows } = await db.query('SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?', [sessionId, productId]);
    return rows[0];
  },

  async getBySessionId(sessionId) {
    const { rows } = await db.query(
      `SELECT ci.*, p.name, p.barcode, p.category, p.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = ?
       ORDER BY ci.scanned_at ASC`,
      [sessionId]
    );
    return rows;
  },

  async getCartTotal(sessionId) {
    const { rows } = await db.query('SELECT COALESCE(SUM(price_at_scan * quantity), 0) as total FROM cart_items WHERE session_id = ?', [sessionId]);
    return parseFloat(rows[0].total);
  },

  async getRecentScans(sessionId, windowSeconds = 30) {
    const { rows } = await db.query(
      `SELECT * FROM cart_items
       WHERE session_id = ? AND scanned_at > DATE_SUB(NOW(), INTERVAL ? SECOND)
       ORDER BY scanned_at DESC`,
      [sessionId, windowSeconds]
    );
    return rows;
  },
};

module.exports = cartModel;
