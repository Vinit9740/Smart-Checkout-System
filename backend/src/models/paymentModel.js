const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const paymentModel = {
  async create(sessionId, userId, amount, method = 'simulate') {
    const id = uuidv4();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    await db.query(
      `INSERT INTO payments (id, session_id, user_id, amount, method, status, transaction_id, paid_at)
       VALUES (?, ?, ?, ?, ?, 'success', ?, NOW())`,
      [id, sessionId, userId, amount, method, transactionId]
    );
    const { rows } = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows[0];
  },

  async findBySessionId(sessionId) {
    const { rows } = await db.query('SELECT * FROM payments WHERE session_id = ? ORDER BY created_at DESC LIMIT 1', [sessionId]);
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const { rows } = await db.query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  },
};

module.exports = paymentModel;
