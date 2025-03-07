const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth_middleware');
const { feedback_middlewares } = require('../middlewares/middlewares');
const Feedback = require('../models/Feedbacks');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/submit', authMiddleware, upload.single('image'), feedback_middlewares, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can submit feedback' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors in /feedback/submit:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  const { feedback } = req.body;
  try {
    const feedbackEntry = new Feedback({
      userId: req.user.id,
      userName: req.user.user_name,
      email: req.user.email,
      feedback,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await feedbackEntry.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.log('Error in /feedback/submit:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

router.post('/list', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view feedback' });
  }
  try {
    const feedbackList = await Feedback.find();
    res.json(feedbackList);
  } catch (error) {
    console.log('Error in /feedback/list:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;