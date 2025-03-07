// routes/orders.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth_middleware');
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/create', authMiddleware, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can create orders' });
  }
  const { products } = req.body; // Array of { productId, quantity }
  try {
    const productIds = products.map(p => p.productId);
    const productDetails = await Product.find({ _id: { $in: productIds } });
    const totalAmount = products.reduce((sum, p) => {
      const product = productDetails.find(pd => pd._id.toString() === p.productId);
      return sum + (product ? product.price * p.quantity : 0);
    }, 0);
    const order = new Order({
      userId: req.user.id,
      products,
      totalAmount,
    });
    await order.save();
    res.json({ message: 'Order created successfully', order });
  } catch (error) {
    console.log('Error in /orders/create:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

router.post('/list', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view orders' });
  }
  try {
    const orders = await Order.find().populate('userId', 'user_name email').populate('products.productId', 'name price');
    res.json(orders);
  } catch (error) {
    console.log('Error in /orders/list:', { message: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;