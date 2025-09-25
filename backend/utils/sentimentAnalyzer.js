// Simple but effective sentiment analysis
const analyzeSentiment = (message, rating) => {
  if (!message) return 'neutral';
  
  const text = message.toLowerCase();
  
  // Strong positive indicators
  const strongPositive = ['excellent', 'outstanding', 'amazing', 'fantastic', 'perfect', 'love', 'brilliant', 'superb'];
  const positive = ['good', 'great', 'nice', 'awesome', 'wonderful', 'happy', 'satisfied', 'pleased', 'impressed'];
  
  // Strong negative indicators  
  const strongNegative = ['terrible', 'horrible', 'awful', 'disgusting', 'hate', 'disappointing', 'useless', 'broken'];
  const negative = ['bad', 'poor', 'worst', 'problem', 'issue', 'complaint', 'unhappy', 'disappointed', 'frustrated'];
  
  // Check for strong matches first
  const hasStrongPositive = strongPositive.some(word => text.includes(word));
  const hasStrongNegative = strongNegative.some(word => text.includes(word));
  
  if (hasStrongPositive) return 'positive';
  if (hasStrongNegative) return 'negative';
  
  // Count regular matches
  const positiveCount = positive.filter(word => text.includes(word)).length;
  const negativeCount = negative.filter(word => text.includes(word)).length;
  
  // Consider rating as well
  let ratingBias = 0;
  if (rating >= 4) ratingBias = 1;
  if (rating <= 2) ratingBias = -1;
  
  const totalScore = (positiveCount - negativeCount) + ratingBias;
  
  if (totalScore > 1) return 'positive';
  if (totalScore < -1) return 'negative';
  
  return 'neutral';
};

// Enhanced analyzer with emoji support
const analyzeSentimentWithEmoji = (message, rating) => {
  if (!message) return 'neutral';
  
  const text = message.toLowerCase();
  
  // Emoji sentiment detection
  const positiveEmojis = ['😊', '😂', '😍', '🥰', '😎', '👍', '⭐', '🌟', '💖', '🎉'];
  const negativeEmojis = ['😞', '😠', '😡', '😢', '😭', '👎', '💔', '😤'];
  
  const hasPositiveEmoji = positiveEmojis.some(emoji => text.includes(emoji));
  const hasNegativeEmoji = negativeEmojis.some(emoji => text.includes(emoji));
  
  if (hasPositiveEmoji) return 'positive';
  if (hasNegativeEmoji) return 'negative';
  
  // Fall back to text analysis
  return analyzeSentiment(message, rating);
};

module.exports = {
  analyzeSentiment,
  analyzeSentimentWithEmoji
};