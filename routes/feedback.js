const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth_middleware'); // Fix import
const { feedback_middlewares } = require('../middlewares/middlewares');
const User = require('../models/Users');
const { validationResult } = require('express-validator');

router.post('/submit', authMiddleware, feedback_middlewares, async (req, res) => {
  if (req.user.role !== 'customer') {
    console.log('Unauthorized attempt to submit feedback:', { userId: req.user.id, role: req.user.role });
    return res.status(403).json({ error: 'Only customers can submit feedback' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors in /feedback/submit:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, phoneNumber, feedback } = req.body;
  try {
    const feedbackEntry = new User({
      userId: req.user.id,
      name,
      email,
      phoneNumber,
      feedback,
    });
    await feedbackEntry.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.log('Error in /feedback/submit:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      userId: req.user.id,
    });
    res.status(500).json({ error: error.message });
  }
});

router.post('/list', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    console.log('Unauthorized attempt to list feedback:', { userId: req.user.id, role: req.user.role });
    return res.status(403).json({ error: 'Only admins can view feedback' });
  }
  try {
    const feedbackList = await User.find({ feedback: { $exists: true } }).select('name email phoneNumber feedback');
    res.json(feedbackList);
  } catch (error) {
    console.log('Error in /feedback/list:', { message: error.message, stack: error.stack, userId: req.user.id });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;