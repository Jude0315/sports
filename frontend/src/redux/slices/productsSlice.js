import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch products by filters
export const fetchProductsByFilters = createAsyncThunk(
  "products/fetchByFilters",
  async ({
    collection,
    size,
    color,
    gender,
    minPrice,
    maxPrice,
    sortBy,
    search,
    category,
    material,
    brand,
    limit,
  }, { rejectWithValue }) => {
    console.log('🔄 Fetching products with filters:', {
      collection, size, color, gender, minPrice, maxPrice, sortBy, search, category, material, brand, limit
    });
    
    try {
      const query = new URLSearchParams();
      if (collection) query.append("collection", collection);
      if (size) query.append("size", size);
      if (color) query.append("color", color);
      if (gender) query.append("gender", gender);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);
      if (sortBy) query.append("sortBy", sortBy);
      if (search) query.append("search", search);
      if (category) query.append("category", category);
      if (material) query.append("material", material);
      if (brand) query.append("brand", brand);
      if (limit) query.append("limit", limit);

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`;
      console.log('🌐 API URL:', url);
      
      const response = await axios.get(url);
      console.log('✅ Products API Response:', response.data);
      console.log('📦 Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('📊 Number of products:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      return response.data;
    } catch (error) {
      console.error('❌ Products API Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single product details
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id, { rejectWithValue }) => {
    console.log('🔄 Fetching product details for ID:', id);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
      );
      console.log('✅ Product Details Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Product Details Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch similar products
export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async ({ id }, { rejectWithValue }) => {
    console.log('🔄 Fetching similar products for ID:', id);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`
      );
      console.log('✅ Similar Products Response:', response.data);
      console.log('📦 Similar products data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      console.log('📊 Number of similar products:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      return response.data;
    } catch (error) {
      console.error('❌ Similar Products Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch best seller product
export const fetchBestSeller = createAsyncThunk(
  "products/fetchBestSeller",
  async (_, { rejectWithValue }) => {
    console.log('🔄 Fetching best seller product...');
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
      );
      console.log('✅ Best Seller Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Best Seller Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update product
// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (updateData, { rejectWithValue }) => { // Remove destructuring here
    console.log('🔄 Updating product ID:', updateData.id);
    
    try {
      // Destructure id and the rest of the data
      const { id, ...productData } = updateData;
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        productData, // Send only the product data without the id
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log('✅ Update Product Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update Product Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: [],
    bestSellerProduct: null,
    updatedProduct: null,
    loading: false,
    error: null,
    bestSellerLoading: false, // ADD THIS
    bestSellerError: null,    // ADD THIS
    filters: {
      category: "",
      size: "",
      color: "",
      gender: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
      search: "",
      material: "",
      collection: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      console.log('🎛️ Setting filters:', action.payload);
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      console.log('🧹 Clearing filters');
      state.filters = {
        category: "",
        size: "",
        color: "",
        gender: "",
        brand: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
        search: "",
        material: "",
        collection: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Products by filters
      .addCase(fetchProductsByFilters.pending, (state) => {
        console.log('⏳ Products loading started');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        console.log('✅ Products loaded successfully:', action.payload);
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
        console.log('📦 Products in state:', state.products.length);
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        console.log('❌ Products loading failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Single product details
      .addCase(fetchProductDetails.pending, (state) => {
        console.log('⏳ Product details loading started');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        console.log('✅ Product details loaded:', action.payload);
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        console.log('❌ Product details loading failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Similar products
      .addCase(fetchSimilarProducts.pending, (state) => {
        console.log('⏳ Similar products loading started');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        console.log('✅ Similar products loaded:', action.payload);
        state.loading = false;
        state.similarProducts = Array.isArray(action.payload)
          ? action.payload
          : [];
        console.log('📦 Similar products in state:', state.similarProducts.length);
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        console.log('❌ Similar products loading failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        console.log('⏳ Product update started');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        console.log('✅ Product updated:', action.payload);
        state.loading = false;
        state.updatedProduct = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        console.log('❌ Product update failed:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Best seller - FIXED: Use separate states for best seller
      .addCase(fetchBestSeller.pending, (state) => {
        console.log('⏳ Best seller loading started');
        state.bestSellerLoading = true;  // Changed from state.loading
        state.bestSellerError = null;    // Changed from state.error
      })
      .addCase(fetchBestSeller.fulfilled, (state, action) => {
        console.log('✅ Best seller loaded:', action.payload);
        state.bestSellerLoading = false; // Changed from state.loading
        state.bestSellerProduct = action.payload;
      })
      .addCase(fetchBestSeller.rejected, (state, action) => {
        console.log('❌ Best seller loading failed:', action.payload);
        state.bestSellerLoading = false; // Changed from state.loading
        
        // SAFELY extract error message
        if (action.payload && typeof action.payload === 'object') {
          state.bestSellerError = action.payload.message || 
                                 action.payload.error || 
                                 JSON.stringify(action.payload);
        } else {
          state.bestSellerError = action.payload;
        }
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;