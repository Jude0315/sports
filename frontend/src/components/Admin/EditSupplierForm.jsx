// components/EditSupplierForm.jsx
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const EditSupplierForm = ({ supplier, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    product: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        product: supplier.product || '',
        quantity: supplier.quantity || ''
      });
    }
  }, [supplier]);

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
      const response = await fetch(`${API_ENDPOINTS.SUPPLIERS}/${supplier._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Supplier updated successfully!');
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1000);
      } else {
        setMessage(data.message || 'Error updating supplier');
      }
    } catch (error) {
      setMessage('Error updating supplier: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!supplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Supplier</h3>
        
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
            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Product</option>
              <option value="Jerseys">Jerseys</option>
              <option value="Shoes">Shoes</option>
              <option value="Tracksuits">Tracksuits</option>
              <option value="Sports Bags">Sports Bags</option>
              <option value="Socks">Socks</option>
              <option value="Gloves">Gloves</option>
            </select>
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
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Supplier'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierForm;