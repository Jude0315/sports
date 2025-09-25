import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to load cart from localStorage
const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : { products: [], totalPrice: 0 };
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
};

// Clear localStorage cart
const clearLocalStorageCart = () => {
    localStorage.removeItem("cart");
};

// Helper to check if we should make API calls
const shouldMakeApiCall = (userId, guestId, currentCart) => {
    // Don't make API call if no valid IDs
    if (!userId && !guestId) return false;
    
    // Don't make API call if cart is empty
    if (!currentCart.products || currentCart.products.length === 0) return false;
    
    return true;
};

// Fetch cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async ({ userId, guestId }, { rejectWithValue }) => {
        try {
            // Only fetch if we have valid IDs
            if (!userId && !guestId) {
                return { products: [], totalPrice: 0 };
            }

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
                params: { userId, guestId },
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404 && error.response?.data?.message === 'Cart not found') {
                return { products: [], totalPrice: 0 };
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Add to cart
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, quantity, size, color, guestId, userId, productDetails }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const currentCart = state.cart.cart;

            // Only make API call if we have valid IDs
            if (userId || guestId) {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    { productId, quantity, size, color, guestId, userId }
                );
                return response.data;
            } else {
                // No user or guest ID, update local cart only
                // Check if item already exists
                const existingItemIndex = currentCart.products.findIndex(
                    item => item.productId === productId && item.size === size && item.color === color
                );

                let updatedProducts;
                if (existingItemIndex > -1) {
                    // Update quantity
                    updatedProducts = [...currentCart.products];
                    updatedProducts[existingItemIndex].quantity += quantity;
                } else {
                    // Add new item with product details
                    updatedProducts = [...currentCart.products, {
                        productId,
                        quantity,
                        size,
                        color,
                        name: productDetails?.name || 'Product',
                        price: productDetails?.price || 0,
                        image: productDetails?.image || ''
                    }];
                }

                const updatedCart = {
                    ...currentCart,
                    products: updatedProducts,
                    totalPrice: updatedProducts.reduce((total, item) => total + (item.price * item.quantity), 0)
                };
                return updatedCart;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update quantity
// In your cartSlice.js, update the updateCartItemQuantity thunk:
export const updateCartItemQuantity = createAsyncThunk(
    "cart/updateCartItemQuantity",
    async ({ productId, quantity, guestId, userId, size, color }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const currentCart = state.cart.cart;

            // Check if item exists in cart first
            const itemExists = currentCart.products.some(
                item => item.productId === productId && item.size === size && item.color === color
            );

            if (!itemExists) {
                return rejectWithValue({ 
                    message: 'ITEM_NOT_IN_CART', 
                    productId, 
                    size, 
                    color 
                });
            }

            // Only make API call if we have valid IDs
            if (userId || guestId) {
                const response = await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
                    { productId, quantity, guestId, userId, size, color }
                );
                return response.data;
            } else {
                // No user or guest ID, update local cart only
                const updatedProducts = currentCart.products.map(item =>
                    item.productId === productId && item.size === size && item.color === color
                        ? { ...item, quantity: Number(quantity) } // Ensure it's a number
                        : item
                );

                const updatedCart = {
                    ...currentCart,
                    products: updatedProducts,
                    totalPrice: updatedProducts.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0)
                };
                return updatedCart;
            }
        } catch (error) {
            if (error.response?.status === 404 && error.response?.data?.message === 'Cart not found') {
                return rejectWithValue({ message: 'CART_NOT_FOUND', productId, quantity, size, color });
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async ({ productId, size, color }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const userId = state.auth.user?._id || null;
            const guestId = state.auth.guestId || null;
            const currentCart = state.cart.cart;

            // Check if the item actually exists in the current cart first
            // Check if item exists in cart first
// In your updateCartItemQuantity thunk, fix the comparison:
const normalizeId = (id) => {
  if (!id) return '';
  return id.toString ? id.toString() : String(id);
};

const itemExists = currentCart.products.some(item => 
  item.productId.toString() === productId.toString() && 
  item.size === size && 
  item.color === color
);

if (!itemExists) {
  return rejectWithValue({ 
    message: 'ITEM_NOT_IN_CART', 
    productId, 
    size, 
    color 
  });
}

            // Only make API call if we have valid IDs
            if (userId || guestId) {
                const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
                    data: { productId, userId, guestId, size, color },
                });
                return response.data;
            } else {
                // No user or guest ID, just remove from local cart
                const updatedProducts = currentCart.products.filter(
                    item => !(item.productId === productId && item.size === size && item.color === color)
                );
                const updatedCart = {
                    ...currentCart,
                    products: updatedProducts,
                    totalPrice: updatedProducts.reduce((total, item) => total + (item.price * item.quantity), 0)
                };
                return updatedCart;
            }

        } catch (error) {
            if (error.response?.status === 404) {
                // If cart not found on backend, remove from local state
                const state = getState();
                const currentCart = state.cart.cart;
                const updatedProducts = currentCart.products.filter(
                    item => !(item.productId === productId && item.size === size && item.color === color)
                );
                const updatedCart = {
                    ...currentCart,
                    products: updatedProducts,
                    totalPrice: updatedProducts.reduce((total, item) => total + (item.price * item.quantity), 0)
                };
                return updatedCart;
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Merge guest cart
export const mergeCart = createAsyncThunk(
    "cart/mergeCart",
    async ({ guestId, userId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
                { guestId, userId },
                { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: loadCartFromStorage(),
        loading: false,
        error: null,
    },
    reducers: {
        clearCart: (state) => {
            state.cart = { products: [], totalPrice: 0 };
            clearLocalStorageCart();
        },
        createCartWithItem: (state, action) => {
            const { productId, quantity, size, color } = action.payload;
            state.cart = {
                products: [{
                    productId,
                    quantity,
                    size,
                    color,
                    name: 'Product',
                    price: 0,
                    image: ''
                }],
                totalPrice: 0
            };
            saveCartToStorage(state.cart);
        },
        // Add this to manually sync with backend
        syncCartWithBackend: (state, action) => {
            state.cart = action.payload;
            saveCartToStorage(action.payload);
        },
        // Add item to local cart only (for guest users)
        addToLocalCart: (state, action) => {
            const { productId, quantity, size, color, name, price, image } = action.payload;
            
            const existingItemIndex = state.cart.products.findIndex(
                item => item.productId === productId && item.size === size && item.color === color
            );

            if (existingItemIndex > -1) {
                // Update quantity
                state.cart.products[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                state.cart.products.push({
                    productId,
                    quantity,
                    size,
                    color,
                    name,
                    price,
                    image
                });
            }

            state.cart.totalPrice = state.cart.products.reduce(
                (total, item) => total + (item.price * item.quantity), 0
            );
            
            saveCartToStorage(state.cart);
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchCart
            .addCase(fetchCart.pending, state => { state.loading = true; state.error = null; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch cart";
            })

            // addToCart
            .addCase(addToCart.pending, state => { state.loading = true; state.error = null; })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to add to cart";
            })

            // updateCartItemQuantity
            .addCase(updateCartItemQuantity.pending, state => { state.loading = true; state.error = null; })
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(updateCartItemQuantity.rejected, (state, action) => {
                state.loading = false;
                if (action.payload?.message === 'CART_NOT_FOUND') {
                    state.error = "Please add the item to cart first";
                } else {
                    state.error = action.payload?.message || "Failed to update item quantity";
                }
            })

            // removeFromCart
            .addCase(removeFromCart.pending, state => { state.loading = true; state.error = null; })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to remove item";
            })

            // mergeCart
            .addCase(mergeCart.pending, state => { state.loading = true; state.error = null; })
            .addCase(mergeCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                saveCartToStorage(action.payload);
            })
            .addCase(mergeCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to merge cart";
            });
    },
});

export const { clearCart, createCartWithItem, syncCartWithBackend, addToLocalCart } = cartSlice.actions;
export default cartSlice.reducer;