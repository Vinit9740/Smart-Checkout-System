const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const userModel = {
  async create(name, email, passwordHash) {
    const id = uuidv4();
    await db.query(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, name, email, passwordHash]
    );
    const { rows } = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },
};

module.exports = userModel;
