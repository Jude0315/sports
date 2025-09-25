import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';

const SupplierSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_ENDPOINTS.SUPPLIERS_SEARCH}?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      setError('Failed to search suppliers. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Search Suppliers</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p>Searching...</p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Search Results ({searchResults.length})</h4>
          <div className="space-y-2">
            {searchResults.map((supplier) => (
              <div key={supplier._id} className="border rounded-lg p-3">
                <p className="font-medium">{supplier.name}</p>
                <p className="text-gray-600">{supplier.email}</p>
                <p className="text-gray-600">{supplier.product}</p>
                <p className="text-gray-600">Quantity: {supplier.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchTerm && searchResults.length === 0 && !error && (
        <div className="text-center py-4">
          <p>No suppliers found matching "{searchTerm}"</p>
        </div>
      )}

      {!searchTerm && (
        <div className="text-center py-4 text-gray-500">
          <p>Enter a search term to find suppliers</p>
        </div>
      )}
    </div>
  );
};

export default SupplierSearch;