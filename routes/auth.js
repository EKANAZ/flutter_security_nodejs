const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/Users');
const { register_middlewares, login_middlewares } = require('../middlewares/middlewares');
const authMiddleware = require('../middlewares/auth_middleware');
const { validationResult } = require('express-validator');

const initializeAdmin = async () => {
    try {
        const adminExists = await User.findOne({ user_name: 'admin' });
        if (!adminExists) {
            const adminUser = new User({
                name: 'Admin',
                email: 'admin@example.com',
                phone: '1234567890',
                user_name: 'admin',
                password: 'admin1234',
                feedback: 'admin',
                role: 'admin',
            });
            await adminUser.save();
            console.log('Default admin created');
        }
    } catch (error) {
        console.log('Error initializing admin:', { message: error.message, stack: error.stack });
    }
};
initializeAdmin();

router.post('/register', authMiddleware, register_middlewares, async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can register users' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors in /auth/register:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, user_name, password } = req.body;
    try {
      const user = new User({ name, email, phone, user_name, password, role: 'customer' });
      await user.save();
      const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ accessToken, refreshToken });
    } catch (error) {
      console.log('Error in /auth/register:', { message: error.message, stack: error.stack });
      res.status(500).json({ error: error.message });
    }
  });

router.post('/login', login_middlewares, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors in /auth/login:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    const { user_name, password } = req.body;
    try {
        const user = await User.findOne({ user_name });
        if (!user || !(await user.comparePassword(password))) {
            console.log('Invalid credentials in /auth/login:', { user_name });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.log('Error in /auth/login:', { message: error.message, stack: error.stack, requestBody: req.body });
        res.status(500).json({ error: error.message });
    }
});

router.post('/oauth-login', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        console.log('No ID token provided in /auth/oauth-login');
        return res.status(401).json({ error: 'No ID token provided' });
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: decodedToken.name || 'OAuth User',
                email,
                phone: 'N/A', // Could prompt for phone later
                user_name: email.split('@')[0], // Simplified username
                password: 'oauth_' + Math.random().toString(36).slice(2), // Dummy password
                role: 'customer', // Default to customer for OAuth
            });
            await user.save();
        }
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.log('Error in /auth/oauth-login:', { message: error.message, stack: error.stack });
        res.status(401).json({ error: 'Invalid ID token' });
    }
});

router.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        console.log('No refresh token provided in /auth/refresh-token');
        return res.status(401).json({ error: 'No refresh token provided' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const accessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    } catch (error) {
        console.log('Error in /auth/refresh-token:', { message: error.message, stack: error.stack, refreshToken });
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

router.post('/list-customers', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        console.log('Unauthorized attempt to list customers:', { userId: req.user.id, role: req.user.role });
        return res.status(403).json({ error: 'Only admins can list customers' });
    }
    try {
        const customers = await User.find({ role: 'customer' });
        res.json(customers);
    } catch (error) {
        console.log('Error in /auth/list-customers:', { message: error.message, stack: error.stack, userId: req.user.id });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;