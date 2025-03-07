// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  feedback: { type: String, required: true },
  imageUrl: { type: String }, // URL to uploaded image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);