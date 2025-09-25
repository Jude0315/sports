import React from 'react';
import FeedbackForm from '../components/Feedback/FeedbackForm';

const Feedback = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback</h1>
          <p className="text-gray-600">
            We value your opinion. Help us improve our services by sharing your experience.
          </p>
        </div>
        <FeedbackForm />
      </div>
    </div>
  );
};

export default Feedback;