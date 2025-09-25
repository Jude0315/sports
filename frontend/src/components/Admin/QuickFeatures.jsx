import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts } from "../../redux/slices/adminProductSlice";

const QuickFeatures = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.adminProducts);
  const [email, setEmail] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  // Filter products based on stock threshold
  const lowStockProducts = products.filter(
    product => (product.countInStock || 0) <= threshold
  );

  const handleSendEmail = async () => {
    if (!email) {
      setMessage("Please enter an email address");
      return;
    }

    setIsSending(true);
    setMessage("");
    
    try {
      const apiUrl = 'http://localhost:9000/api/send-low-stock-report';
      console.log('Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          threshold,
          products: lowStockProducts
        }),
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      // For debugging, let's see what the response text is
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      
      if (response.ok) {
        setMessage(`Low stock report with PDF attachment sent to ${email}`);
        setEmail("");
      } else {
        setMessage(data.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      setMessage(`Error: ${error.message}. Check if the server is running on port 9000.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Features</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Email Low Stock Report</h3>
        <p className="text-gray-600 mb-6">
          Send a PDF report of products with low stock levels directly to your email.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Threshold
            </label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={5}>5 items or less (Urgent)</option>
              <option value={10}>10 items or less</option>
              <option value={15}>15 items or less</option>
              <option value={20}>20 items or less</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to send report"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleSendEmail}
            disabled={isSending || lowStockProducts.length === 0 || !email}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending PDF Report...' : 'Send PDF Report via Email'}
          </button>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
        
        {lowStockProducts.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Found {lowStockProducts.length} products with {threshold} items or less in stock.
            </p>
            <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
              {lowStockProducts.map(product => (
                <div key={product._id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium">{product.name}</span>
                  <span className={`font-semibold ${(product.countInStock || 0) <= 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {product.countInStock || 0} in stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md">
            No products found with {threshold} items or less in stock.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickFeatures;