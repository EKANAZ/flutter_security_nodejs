// // C:\Users\ekana\Downloads\flutter_security_api\models\Customer.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const customerSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   user_name: { type: String, required: true, unique: true }, // Added username
//   password: { type: String, required: true }, // Added password
//   role: { type: String, enum: ['customer'], default: 'customer' }, // Fixed role as 'customer'
//   createdAt: { type: Date, default: Date.now },
// });

// customerSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// customerSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model('Customer', customerSchema);