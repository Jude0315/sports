import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState('neutral');

  const { user } = useSelector((state) => state.auth);

  // Get backend URL from environment variable
  const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

  // Analyze sentiment when message changes
  useEffect(() => {
    if (formData.message.length > 10) {
      const analyze = async () => {
        const text = formData.message.toLowerCase();
        const positiveWords = ['excellent', 'love', 'great', 'awesome', 'perfect', 'good', 'happy', 'amazing', 'fantastic', 'wonderful'];
        const negativeWords = ['terrible', 'hate', 'awful', 'bad', 'disappointed', 'poor', 'problem', 'horrible', 'disgusting', 'broken'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) setSentiment('positive');
        else if (negativeCount > positiveCount) setSentiment('negative');
        else setSentiment('neutral');
      };
      
      analyze();
    } else {
      setSentiment('neutral');
    }
  }, [formData.message]);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // USE THE ENVIRONMENT VARIABLE
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user: user?._id,
        }),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessage('Thank you for your feedback! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 5,
      });
      setSentiment('neutral');
      
    } catch (error) {
      console.error('Submission error:', error);
      setMessage(error.message || 'Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sentiment display component
  const SentimentDisplay = ({ sentiment }) => {
    const config = {
      positive: { emoji: '😊', color: 'text-green-600', bg: 'bg-green-100', text: 'Positive' },
      negative: { emoji: '😞', color: 'text-red-600', bg: 'bg-red-100', text: 'Negative' },
      neutral: { emoji: '😐', color: 'text-gray-600', bg: 'bg-gray-100', text: 'Neutral' }
    };
    
    const { emoji, color, bg, text } = config[sentiment] || config.neutral;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${bg} ${color}`}>
        <span className="mr-1">{emoji}</span>
        <span className="text-sm font-medium">{text}</span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Send Us Feedback</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('Thank you') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        
        {/* Subject Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Rating Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating *</label>
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className={`text-2xl ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.rating === 1 && 'Poor'}
            {formData.rating === 2 && 'Fair'}
            {formData.rating === 3 && 'Good'}
            {formData.rating === 4 && 'Very Good'}
            {formData.rating === 5 && 'Excellent'}
          </p>
        </div>

        {/* Message Field with Sentiment Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Tell us about your experience..."
          />
          {/* Sentiment Display */}
          {formData.message.length > 10 && (
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600 mr-2">Detected sentiment:</span>
              <SentimentDisplay sentiment={sentiment} />
            </div>
          )}
          {formData.message.length > 0 && formData.message.length <= 10 && (
            <p className="text-xs text-gray-500 mt-1">Keep typing for sentiment analysis...</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Sentiment Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">How Sentiment Analysis Works</h3>
        <p className="text-sm text-blue-700">
          Our system automatically analyzes your feedback to understand your sentiment. 
          This helps us prioritize and respond to your concerns more effectively.
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="text-center p-2 bg-green-100 rounded">
            <span className="text-lg">😊</span>
            <p>Positive - Happy feedback</p>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded">
            <span className="text-lg">😐</span>
            <p>Neutral - General feedback</p>
          </div>
          <div className="text-center p-2 bg-red-100 rounded">
            <span className="text-lg">😞</span>
            <p>Negative - Needs attention</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;