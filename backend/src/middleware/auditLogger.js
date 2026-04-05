const auditModel = require('../models/auditModel');

const auditLogger = (action, resource) => {
  return (req, res, next) => {
    // Log after response is sent (non-blocking)
    res.on('finish', () => {
      const userId = req.user ? req.user.id : null;
      const resourceId = req.params.id || req.params.sessionId || req.params.code || null;
      const ip = req.ip || req.connection.remoteAddress;

      auditModel.log(userId, action, resource, resourceId, ip, {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      });
    });

    next();
  };
};

module.exports = auditLogger;
