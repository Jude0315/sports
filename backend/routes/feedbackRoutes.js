const express = require('express');
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendThankYouEmail, sendFeedbackResponse } = require('../utils/emailService');
const { analyzeSentimentWithEmoji } = require('../utils/sentimentAnalyzer');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message, rating, ...rest } = req.body;
    
    // Analyze sentiment
    const sentiment = analyzeSentimentWithEmoji(message, rating);
    
    const feedback = new Feedback({
      ...rest,
      message,
      rating,
      sentiment // ADD SENTIMENT
    });
    
    const savedFeedback = await feedback.save();

    // Send thank you email
    await sendThankYouEmail(savedFeedback);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: savedFeedback,
      sentiment: savedFeedback.sentiment // Return sentiment to frontend
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query object
    const query = {};
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
      .populate('adminResponse.respondedBy', 'name');

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/feedback/:id/respond
// @desc    Respond to feedback (admin only)
// @access  Private/Admin
router.put('/:id/respond', protect, admin, async (req, res) => {
  try {
    const { responseMessage } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.adminResponse = {
      message: responseMessage,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };
    feedback.status = 'replied';

    const updatedFeedback = await feedback.save();

    // Send response email to user
    await sendFeedbackResponse(updatedFeedback, responseMessage);

    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/feedback/:id/highlight
// @desc    Highlight a feedback (admin only)
// @access  Private/Admin
router.put('/:id/highlight', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Toggle the highlighted status
    feedback.highlighted = !feedback.highlighted;
    const updatedFeedback = await feedback.save();

    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (admin only)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: 'pending' });
    const reviewed = await Feedback.countDocuments({ status: 'reviewed' });
    const replied = await Feedback.countDocuments({ status: 'replied' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });

    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sentiment statistics
    const sentimentStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total,
      pending,
      reviewed,
      replied,
      resolved,
      ratingStats,
      sentimentStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    // TEMPORARY: Hardcode the URL and use a test endpoint
    const response = await fetch('http://localhost:9000/', { // Test the root endpoint
      method: 'GET',
    });

    if (response.ok) {
      console.log('Backend is running!');
      setMessage('Backend is working! Now fix the route parameter error.');
    } else {
      setMessage('Backend is not responding properly.');
    }
    
  } catch (error) {
    console.error('Connection error:', error);
    setMessage('Cannot connect to backend. Server is probably crashed.');
  } finally {
    setLoading(false);
  }
};

module.exports = router;