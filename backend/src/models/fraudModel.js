const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const fraudModel = {
  async create(sessionId, userId, riskScore, flags, details) {
    const id = uuidv4();
    await db.query(
      `INSERT INTO fraud_logs (id, session_id, user_id, risk_score, flags, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, sessionId, userId, riskScore, JSON.stringify(flags), details]
    );
    const { rows } = await db.query('SELECT * FROM fraud_logs WHERE id = ?', [id]);
    return rows[0];
  },

  async findBySessionId(sessionId) {
    const { rows } = await db.query('SELECT * FROM fraud_logs WHERE session_id = ? ORDER BY created_at DESC', [sessionId]);
    return rows;
  },

  async getHighRiskSessions(threshold = 50) {
    const { rows } = await db.query(
      `SELECT fl.*, u.name as user_name, u.email as user_email
       FROM fraud_logs fl
       JOIN users u ON fl.user_id = u.id
       WHERE fl.risk_score >= ?
       ORDER BY fl.risk_score DESC`,
      [threshold]
    );
    return rows;
  },
};

module.exports = fraudModel;
