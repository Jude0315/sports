const dotenv =require('dotenv');
const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    
    // Send welcome email
    const emailResult = await sendWelcomeEmail(savedSupplier);
    
    // Update email status
    if (emailResult.success) {
      await Supplier.findByIdAndUpdate(savedSupplier._id, {
        emailSent: true,
        emailSentAt: new Date()
      });
    }
    
    res.status(201).json({
      supplier: savedSupplier,
      emailStatus: emailResult
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Supplier with this email already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Add other supplier routes (search, update, delete, etc.)
// Search suppliers
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');
  try {
    const suppliers = await Supplier.find({
      $or: [
        { name: regex },
        { email: regex },
        { product: regex }
      ]
    }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend email to specific supplier
router.post('/:id/resend-email', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const emailResult = await sendWelcomeEmail(supplier);
    
    if (emailResult.success) {
      await Supplier.findByIdAndUpdate(supplier._id, {
        emailSent: true,
        emailSentAt: new Date()
      });
    }

    res.json(emailResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;