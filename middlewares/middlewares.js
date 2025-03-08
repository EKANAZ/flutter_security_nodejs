      const { body, check } = require('express-validator');
      const bodyParser = require('body-parser');
      const { highSecurityRateLimiter, mediumSecurityRateLimiter } = require('./rate_limiter');

      const register_middlewares = [
        bodyParser.json(),
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('email').trim().isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 4, max: 30 }).withMessage('Password must be between 4 and 30 characters'),
        body('user_name').isLength({ min: 4, max: 20 }).withMessage('Username must be between 4 and 20 characters'),
        check('user_name').custom(async value => {
          const user = await require('../models/Users').findOne({ user_name: value });
          if (user) throw new Error('Username already exists');
        }),
      ];

      const login_middlewares = [
        mediumSecurityRateLimiter,
        bodyParser.json(),
        body('user_name').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
      ];

      const feedback_middlewares = [
        bodyParser.json(),
        body('name').notEmpty().withMessage('Name is required'),
        body('email').notEmpty().isEmail().withMessage('Valid email is required'),
        body('phoneNumber').notEmpty().withMessage('Phone number is required'),
        // body('feedback').notEmpty().withMessage('Feedback is required'),
      ];

      module.exports = { register_middlewares, login_middlewares, feedback_middlewares };