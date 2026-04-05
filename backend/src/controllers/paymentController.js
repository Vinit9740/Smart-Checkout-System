const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const cartModel = require('../models/cartModel');
const sessionModel = require('../models/sessionModel');
const paymentModel = require('../models/paymentModel');
const AppError = require('../utils/AppError');

const paymentController = {
  async pay(req, res, next) {
    try {
      const { sessionId, method } = req.body;

      // Verify session
      const session = await sessionModel.findById(sessionId);
      if (!session) {
        return next(new AppError('Session not found.', 404));
      }
      if (session.user_id !== req.user.id) {
        return next(new AppError('Access denied.', 403));
      }
      if (session.status !== 'active') {
        return next(new AppError('This session is no longer active.', 400));
      }

      // Check if already paid
      const existingPayment = await paymentModel.findBySessionId(sessionId);
      if (existingPayment && existingPayment.status === 'success') {
        return next(new AppError('Payment already completed for this session.', 400));
      }

      // Calculate total
      const total = await cartModel.getCartTotal(sessionId);
      if (total <= 0) {
        return next(new AppError('Cart is empty. Add items before paying.', 400));
      }

      // Process payment (simulated)
      const payment = await paymentModel.create(sessionId, req.user.id, total, method);

      // Update session: set total, mark completed, generate QR token
      const qrToken = uuidv4();
      await sessionModel.setTotalAmount(sessionId, total);
      await sessionModel.updateStatus(sessionId, 'completed');
      await sessionModel.setQrToken(sessionId, qrToken);

      // Generate QR code as data URL
      const qrData = JSON.stringify({
        sessionId,
        qrToken,
        userId: req.user.id,
        amount: total,
        transactionId: payment.transaction_id,
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });

      res.json({
        success: true,
        message: 'Payment successful!',
        data: {
          payment,
          qrToken,
          qrCode: qrCodeDataUrl,
          total,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const history = await paymentModel.findByUserId(req.user.id);
      
      // Inject complete bill items into the history payload
      const fullHistory = [];
      for (const record of history) {
        const items = await cartModel.getBySessionId(record.session_id);
        fullHistory.push({
          ...record,
          items: items || [],
        });
      }

      res.json({
        success: true,
        data: fullHistory,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
