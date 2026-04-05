const cartModel = require('../models/cartModel');
const fraudModel = require('../models/fraudModel');

const THRESHOLDS = {
  FAST_SCAN_INTERVAL_SEC: 2,
  FAST_SCAN_COUNT: 5,
  HIGH_VALUE_CART: 5000,
  BURST_WINDOW_SEC: 30,
  BURST_ITEM_COUNT: 8,
  HIGH_RISK_SCORE: 70,
};

const fraudService = {
  /**
   * Analyze a session for suspicious activity.
   * Returns { riskScore, flags }
   */
  async analyzeSession(sessionId, userId) {
    const flags = [];
    let riskScore = 0;

    // 1. Check for rapid scanning (many scans in a short window)
    const recentScans = await cartModel.getRecentScans(sessionId, THRESHOLDS.BURST_WINDOW_SEC);

    if (recentScans.length >= THRESHOLDS.BURST_ITEM_COUNT) {
      flags.push('RAPID_BURST_SCANNING');
      riskScore += 30;
    }

    if (recentScans.length >= THRESHOLDS.FAST_SCAN_COUNT) {
      // Check time gaps between consecutive scans
      let fastScanCount = 0;
      for (let i = 1; i < recentScans.length; i++) {
        const gap = (new Date(recentScans[i - 1].scanned_at) - new Date(recentScans[i].scanned_at)) / 1000;
        if (gap < THRESHOLDS.FAST_SCAN_INTERVAL_SEC) {
          fastScanCount++;
        }
      }
      if (fastScanCount >= 3) {
        flags.push('VERY_FAST_SCAN_PATTERN');
        riskScore += 25;
      }
    }

    // 2. Check for unusual cart value
    const cartTotal = await cartModel.getCartTotal(sessionId);
    if (cartTotal > THRESHOLDS.HIGH_VALUE_CART) {
      flags.push('HIGH_VALUE_CART');
      riskScore += 15;
    }

    // 3. Check for single-product bulk quantity
    const cartItems = await cartModel.getBySessionId(sessionId);
    for (const item of cartItems) {
      if (item.quantity > 10) {
        flags.push(`BULK_QUANTITY:${item.name}`);
        riskScore += 20;
      }
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Log if any flags were raised
    if (flags.length > 0) {
      await fraudModel.create(
        sessionId,
        userId,
        riskScore,
        flags,
        `Automated fraud check: ${flags.length} flag(s) detected`
      );
    }

    return { riskScore, flags, isHighRisk: riskScore >= THRESHOLDS.HIGH_RISK_SCORE };
  },
};

module.exports = fraudService;
