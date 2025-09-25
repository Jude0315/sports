import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

// Simple JWT decoder (no external dependencies needed)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const AdminFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [responseMessage, setResponseMessage] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

  // Get token from localStorage and decode it
  const token = localStorage.getItem('userToken');
  let decodedToken = null;
  let isAdmin = false;

  if (token) {
    try {
      decodedToken = decodeJWT(token);
      isAdmin = decodedToken?.user?.role === 'admin';
      console.log('Decoded token:', decodedToken);
      console.log('Is admin from token:', isAdmin);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    console.log('UserInfo from Redux:', userInfo);
    console.log('Token from localStorage:', token ? 'Exists' : 'Missing');
    console.log('Is admin:', isAdmin);
    
    // Check if we have a valid token
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin (from token)
    if (!isAdmin) {
      console.log('User is not admin');
      setLoading(false);
      return;
    }
    
    fetchFeedbacks();
  }, [filter, currentPage, searchTerm, navigate, token, isAdmin]);

  const fetchFeedbacks = async () => {
    // Check if we have a token
    if (!token) {
      console.error('No authentication token');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE}/api/feedback?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          alert('Session expired. Please login again.');
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Feedback data received:', data);
      setFeedbacks(data.feedback);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      alert('Failed to load feedbacks. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!token) {
      alert('Please login again');
      navigate('/login');
      return;
    }

    try {
      setGeneratingReport(true);
      
      // Fetch all feedback data for the report
      const queryParams = new URLSearchParams({
        limit: 1000, // Fetch a large number of records for the report
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE}/api/feedback?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const allFeedbacks = data.feedback;

      // Prepare data for Excel
      const reportData = allFeedbacks.map(feedback => ({
        'Customer Name': feedback.name,
        'Email': feedback.email,
        'Subject': feedback.subject,
        'Rating': feedback.rating,
        'Sentiment': feedback.sentiment,
        'Status': feedback.status,
        'Message': feedback.message,
        'Admin Response': feedback.adminResponse?.message || 'No response',
        'Responded By': feedback.adminResponse?.respondedBy?.name || 'N/A',
        'Responded At': feedback.adminResponse?.respondedAt 
          ? new Date(feedback.adminResponse.respondedAt).toLocaleString() 
          : 'N/A',
        'Created At': new Date(feedback.createdAt).toLocaleString(),
        'Highlighted': feedback.highlighted ? 'Yes' : 'No'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(reportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Feedback Report');
      
      // Generate Excel file
      const fileName = `feedback_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      alert('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please check console for details.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleDeleteFeedback = async (id) => {
    if (!token) {
      alert('Please login again');
      navigate('/login');
      return;
    }

    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const response = await fetch(`${API_BASE}/api/feedback/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Feedback deleted successfully');
          fetchFeedbacks();
        } else {
          alert('Failed to delete feedback');
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Error deleting feedback');
      }
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please login again');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/feedback/${selectedFeedback._id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ responseMessage })
      });

      if (response.ok) {
        alert('Response sent successfully');
        setShowModal(false);
        setResponseMessage('');
        fetchFeedbacks();
      } else {
        alert('Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error sending response');
    }
  };

  const highlightFeedback = async (id) => {
    if (!token) {
      alert('Please login again');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/feedback/${id}/highlight`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Feedback highlighted');
        fetchFeedbacks();
      } else {
        alert('Failed to highlight feedback');
      }
    } catch (error) {
      console.error('Error highlighting feedback:', error);
      alert('Error highlighting feedback');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      replied: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSentimentIcon = (sentiment) => {
    const icons = {
      positive: '😊',
      neutral: '😐',
      negative: '😞'
    };

    return (
      <span className="text-xl" title={sentiment}>
        {icons[sentiment] || '😐'}
      </span>
    );
  };

  // Render loading/error states
  if (!token) {
    return <div className="flex justify-center items-center h-64">Redirecting to login...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You must be an administrator to view this page.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading feedbacks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Feedback</h1>
        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            disabled={generatingReport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {generatingReport ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="all">All Feedback</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Loading...' : 'No feedback found'}
                </td>
              </tr>
            ) : (
              feedbacks.map((feedback) => (
                <tr key={feedback._id} className={feedback.highlighted ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                    <div className="text-sm text-gray-500">{feedback.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{feedback.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSentimentIcon(feedback.sentiment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(feedback.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewFeedback(feedback)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => highlightFeedback(feedback._id)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Highlight this feedback"
                    >
                      ⭐
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Feedback Detail Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-start justify-between p-4 border-b rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">
                Feedback Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer Name</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedFeedback.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedFeedback.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedFeedback.subject}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                    ({selectedFeedback.rating}/5)
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Sentiment</h4>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {getSentimentIcon(selectedFeedback.sentiment)} {selectedFeedback.sentiment}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Message</h4>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedFeedback.message}
                </p>
              </div>
              
              {selectedFeedback.adminResponse && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Admin Response</h4>
                  <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded-md">
                    {selectedFeedback.adminResponse.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Responded by {selectedFeedback.adminResponse.respondedBy?.name} on{' '}
                    {new Date(selectedFeedback.adminResponse.respondedAt).toLocaleString()}
                  </p>
                </div>
              )}
              
              {selectedFeedback.status !== 'replied' && selectedFeedback.status !== 'resolved' && (
                <form onSubmit={handleRespond}>
                  <div>
                    <label htmlFor="responseMessage" className="block text-sm font-medium text-gray-700">
                      Response Message
                    </label>
                    <textarea
                      id="responseMessage"
                      rows="4"
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Type your response here..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-70 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Send Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackList;