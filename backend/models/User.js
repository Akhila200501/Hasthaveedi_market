//models/User.js

const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, validate: {
    validator: function(v) {
      return /^\+?\d{10,15}$/.test(v);
    },
    message: props => `${props.value} is not a valid phone number!`
  }
},
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, validate: [isEmail, 'Please provide a valid email']},

  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationSentAt: { type: Date }
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);