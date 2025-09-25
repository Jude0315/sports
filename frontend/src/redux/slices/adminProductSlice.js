import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;
const USER_TOKEN = `Bearer ${localStorage.getItem("userToken")}`;

// async thunk to fetch admin products
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: USER_TOKEN,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch products");
    }
  }
);

// async function to create a new product
export const createProduct = createAsyncThunk(
    "adminProducts/createProduct",
    async (productData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/products`,
                productData,
                {
                    headers: {
                        Authorization: USER_TOKEN,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to create product");
        }
    }
);

////////////////////////////


/////////////////

// async thunk to update an existing product
export const updateProduct = createAsyncThunk(
    "adminProducts/updateProduct",
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/admin/products/${id}`,
                productData,
                {
                    headers: {
                        Authorization: USER_TOKEN,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to update product");
        }
    }
);

// async thunk to delete a product
export const deleteProduct = createAsyncThunk(
    "adminProducts/deleteProduct",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/api/products/${id}`, {
                headers: { Authorization: USER_TOKEN },
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to delete product");
        }
    }
);

const adminProductSlice = createSlice({
    name: "adminProducts",
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchAdminProducts.pending, (state) => {
            state.loading = true;
        })

        .addCase(fetchAdminProducts.fulfilled, (state, action) => {
    state.loading = false;
    state.products = action.payload;
        })
        .addCase(fetchAdminProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to fetch products";
        })

        // Create Product
.addCase(createProduct.fulfilled, (state, action) => {
    state.products.push(action.payload);
})
// Update Product
.addCase(updateProduct.fulfilled, (state, action) => {
    const index = state.products.findIndex(
        (product) => product._id === action.payload._id
    );
    if (index !== -1) {
        state.products[index] = action.payload;
    }
})

//Delete Product

// Delete Product
.addCase(deleteProduct.fulfilled, (state, action) => {
    state.products = state.products.filter(
        (product) => product._id !== action.payload
    );
});

    },
});

export default adminProductSlice.reducer;
