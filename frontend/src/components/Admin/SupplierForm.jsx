// components/SupplierForm.jsx
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useProducts } from '../../hooks/useProducts';

const SupplierForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { products, loading: productsLoading, error: productsError } = useProducts();

  // Map specific product names to valid enum categories
  const mapProductToCategory = (productName) => {
    const categoryMap = {
      // Basketball products
      "Men's Basketball Arm Sleeves": "Gloves",
      "Basketball Jersey": "Jerseys",
      "Basketball Shorts": "Tracksuits",
      "Basketball Shoes": "Shoes",
      
      // Football products
      "Football Cleats": "Shoes",
      "Football Jersey": "Jerseys",
      "Goalkeeper Gloves": "Gloves",
      "Football Socks": "Socks",
      
      // Gym & Fitness
      "Men's Gym Gloves PowerGrip": "Gloves",
      "Training Gloves": "Gloves",
      "Weightlifting Gloves": "Gloves",
      "Gym Bag": "Sports Bags",
      
      // Running
      "Running Shoes": "Shoes",
      "Running Shorts": "Tracksuits",
      "Running Socks": "Socks",
      
      // General categories (fallbacks)
      "Jerseys": "Jerseys",
      "Shoes": "Shoes",
      "Tracksuits": "Tracksuits",
      "Sports Bags": "Sports Bags",
      "Socks": "Socks",
      "Gloves": "Gloves"
    };
    
    return categoryMap[productName] || "Gloves"; // Default to Gloves if not found
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Map the selected product name to a valid category
      const submitData = {
        ...formData,
        product: mapProductToCategory(formData.product)
      };

      console.log('Submitting:', {
        originalProduct: formData.product,
        mappedCategory: submitData.product
      });

      const response = await fetch(API_ENDPOINTS.SUPPLIERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Supplier added successfully! Email sent.');
        setFormData({ name: '', email: '', product: '', quantity: '' });
        onSuccess();
      } else {
        setMessage(data.message || 'Error adding supplier');
      }
    } catch (error) {
      setMessage('Error adding supplier: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Add New Supplier</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Product</label>
          {productsLoading ? (
            <div className="mt-1 p-3 bg-gray-100 rounded-md animate-pulse text-center">
              Loading products from database...
            </div>
          ) : productsError ? (
            <div className="mt-1 p-3 bg-yellow-100 text-yellow-800 rounded-md">
              <p className="text-sm mb-2">⚠️ Could not load products from database</p>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Product (using fallback list)</option>
                <option value="Jerseys">Jerseys</option>
                <option value="Shoes">Shoes</option>
                <option value="Tracksuits">Tracksuits</option>
                <option value="Sports Bags">Sports Bags</option>
                <option value="Socks">Socks</option>
                <option value="Gloves">Gloves</option>
              </select>
            </div>
          ) : (
            <div>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
              {formData.product && (
                <div className="mt-1 text-xs text-blue-600">
                  📝 This will be categorized as: <strong>{mapProductToCategory(formData.product)}</strong>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || productsLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
        >
          {loading ? 'Adding Supplier...' : 'Add Supplier'}
        </button>
      </form>

      {/* Debug info */}
      {!productsLoading && !productsError && (
        <div className="mt-4 p-2 bg-blue-50 text-blue-700 text-sm rounded">
          ✅ Loaded {products.length} products from database
          <br />
          📋 Products will be automatically categorized for supplier management
        </div>
      )}
    </div>
  );
};

export default SupplierForm;