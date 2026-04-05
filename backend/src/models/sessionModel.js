const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const sessionModel = {
  async create(userId) {
    const id = uuidv4();
    await db.query('INSERT INTO sessions (id, user_id) VALUES (?, ?)', [id, userId]);
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findActiveByUserId(userId) {
    const { rows } = await db.query(
      "SELECT * FROM sessions WHERE user_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1",
      [userId]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const completedAt = status === 'completed' ? 'NOW()' : 'NULL';
    await db.query(
      `UPDATE sessions SET status = ?, completed_at = ${completedAt === 'NOW()' ? 'NOW()' : 'NULL'} WHERE id = ?`,
      [status, id]
    );
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async setQrToken(id, qrToken) {
    await db.query('UPDATE sessions SET qr_token = ? WHERE id = ?', [qrToken, id]);
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async setTotalAmount(id, amount) {
    await db.query('UPDATE sessions SET total_amount = ? WHERE id = ?', [amount, id]);
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async verifyExit(id) {
    await db.query('UPDATE sessions SET exit_verified = TRUE WHERE id = ?', [id]);
    const { rows } = await db.query('SELECT * FROM sessions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByQrToken(qrToken) {
    const { rows } = await db.query('SELECT * FROM sessions WHERE qr_token = ?', [qrToken]);
    return rows[0] || null;
  },
};

module.exports = sessionModel;
