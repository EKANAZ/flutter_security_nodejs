// routes/products.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth_middleware');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add products' });
  }
  const { name, description, price } = req.body;
  try {
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await product.save();
    res.json({ message: 'Product added successfully', product });
  } catch (error) {
    console.log('Error in /products/add:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log('Error in /products/list:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;