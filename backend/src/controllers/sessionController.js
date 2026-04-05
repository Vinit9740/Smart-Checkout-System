const sessionModel = require('../models/sessionModel');
const AppError = require('../utils/AppError');

const sessionController = {
  async startSession(req, res, next) {
    try {
      const userId = req.user.id;

      // Check for existing active session
      const activeSession = await sessionModel.findActiveByUserId(userId);
      if (activeSession) {
        return res.json({
          success: true,
          message: 'You already have an active session.',
          data: { session: activeSession },
        });
      }

      const session = await sessionModel.create(userId);

      res.status(201).json({
        success: true,
        message: 'Shopping session started.',
        data: { session },
      });
    } catch (err) {
      next(err);
    }
  },

  async getSession(req, res, next) {
    try {
      const session = await sessionModel.findById(req.params.id);

      if (!session) {
        return next(new AppError('Session not found.', 404));
      }

      // Ensure user can only access their own sessions
      if (session.user_id !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Access denied.', 403));
      }

      res.json({
        success: true,
        data: { session },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = sessionController;
