
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { testEmailConfig, sendTestEmail,sendRefundEmail } = require('../utils/emailService');
const Supplier = require('../models/Supplier');

// Test email configuration
router.get('/test-config', async (req, res) => {
  try {
    const result = await testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Email configuration test failed',
      error: error.message 
    });
  }
});

// Test email sending
router.post('/test-send', async (req, res) => {
  try {
    const { email, name, product, quantity } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await sendTestEmail(email, name, product, quantity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get email statistics
router.get('/stats', async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const emailsSent = await Supplier.countDocuments({ emailSent: true });
    const emailsFailed = await Supplier.countDocuments({ emailSent: false });
    
    res.json({
      totalSuppliers,
      emailsSent,
      emailsFailed,
      successRate: totalSuppliers > 0 ? ((emailsSent / totalSuppliers) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/email/send-email



module.exports = router;