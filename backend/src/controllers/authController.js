const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existing = await userModel.findByEmail(email);
      if (existing) {
        return next(new AppError('An account with this email already exists.', 409));
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await userModel.create(name, email, passwordHash);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userModel.findByEmail(email);
      if (!user) {
        return next(new AppError('Invalid email or password.', 401));
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401));
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
