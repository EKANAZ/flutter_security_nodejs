// // C:\Users\ekana\Downloads\flutter_security_api\routes\customer.js
// const express = require('express');
// const router = express.Router();
// const Customer = require('../models/Customers');
// const authMiddleware = require('../middlewares/auth_middleware');

// router.post('/add', authMiddleware, async (req, res) => {
//   if (req.user.role !== 'admin') {
//     console.log('Unauthorized attempt to add customer:', { userId: req.user.id, role: req.user.role });
//     return res.status(403).json({ error: 'Only admins can add customers' });
//   }

//   const { name, email, phone, user_name, password } = req.body;
//   try {
//     const customer = new Customer({ name, email, phone, user_name, password, role: 'customer' });
//     await customer.save();
//     res.status(201).json({ message: 'Customer added successfully', customer });
//   } catch (error) {
//     console.log('Error in /customer/add:', {
//       message: error.message,
//       stack: error.stack,
//       requestBody: req.body,
//       userId: req.user.id,
//     });
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;