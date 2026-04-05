const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const auditModel = {
  async log(userId, action, resource, resourceId, ipAddress, details = {}) {
    const id = uuidv4();
    try {
      await db.query(
        `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_address, details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, action, resource, resourceId, ipAddress, JSON.stringify(details)]
      );
    } catch (err) {
      console.error('Audit log write failed:', err.message);
    }
  },
};

module.exports = auditModel;
