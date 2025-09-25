// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const url = API_ENDPOINTS.PRODUCTS_DROPDOWN;
        console.log('🔄 Fetching from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log('📊 Response status:', response.status, response.statusText);
        
        // First, read the response as text to see what we're getting
        const responseText = await response.text();
        console.log('📄 Raw response (first 200 chars):', responseText.substring(0, 200));
        
        // Check if it's HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html')) {
          console.error('❌ Received HTML instead of JSON. Possible causes:');
          console.error('1. Wrong URL');
          console.error('2. Server redirect');
          console.error('3. Server error page');
          throw new Error('Server returned HTML page instead of JSON data');
        }
        
        // If it's not HTML, try to parse as JSON
        try {
          const data = JSON.parse(responseText);
          console.log('✅ Parsed JSON data:', data);
          setProducts(data);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON:', parseError);
          throw new Error('Invalid JSON response from server');
        }
        
      } catch (err) {
        setError(err.message);
        console.error('❌ Error details:', err);
        
        // Fallback to hardcoded products
        setProducts([
          {_id: "1", name: "Men's Basketball Jersey"},
          {_id: "2", name: "Basketball Shoes"},
          {_id: "3", name: "Football Boots"},
          {_id: "4", name: "Running Shoes"},
          {_id: "5", name: "Training Gear"}
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};