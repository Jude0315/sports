const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    trim: true,
    unique: true,
  },
  product: {
    type: String,
    required: true,
    enum: ['Jerseys', 'Shoes', 'Tracksuits', 'Sports Bags', 'Socks', 'Gloves'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);