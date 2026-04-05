const sessionModel = require('../models/sessionModel');
const paymentModel = require('../models/paymentModel');
const AppError = require('../utils/AppError');

const exitController = {
  async verify(req, res, next) {
    try {
      const { qrToken } = req.body;

      // Find session by QR token
      const session = await sessionModel.findByQrToken(qrToken);
      if (!session) {
        return next(new AppError('Invalid QR code. Session not found.', 404));
      }

      // Check session status
      if (session.status !== 'completed') {
        return next(new AppError('Session is not completed. Payment required.', 400));
      }

      // Check if already exited
      if (session.exit_verified) {
        return next(new AppError('Exit already verified for this session.', 400));
      }

      // Verify payment exists
      const payment = await paymentModel.findBySessionId(session.id);
      if (!payment || payment.status !== 'success') {
        return next(new AppError('Payment not found or unsuccessful.', 400));
      }

      // Mark exit as verified
      await sessionModel.verifyExit(session.id);

      res.json({
        success: true,
        message: 'Exit verified! You may leave the store.',
        data: {
          sessionId: session.id,
          totalAmount: session.total_amount,
          exitVerified: true,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = exitController;
