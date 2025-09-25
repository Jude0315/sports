// config/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

export const API_ENDPOINTS = {
  SUPPLIERS: `${API_BASE_URL}/api/suppliers`,
  SUPPLIERS_SEARCH: `${API_BASE_URL}/api/suppliers/search`,
  // Add other endpoints as needed
  PRODUCTS: `${API_BASE_URL}/api/admin/products`, // Your existing admin endpoint
  PRODUCTS_DROPDOWN: `${API_BASE_URL}/api/admin/products/dropdown`, // New dropdown e
};

export default API_BASE_URL;