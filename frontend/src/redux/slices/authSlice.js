import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Create a standalone mergeCart function that doesn't import from cartSlice
const mergeCartAPI = async ({ guestId, userId, token }) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
      { guestId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      // Merge guest cart into user cart after successful login
      const { guestId } = getState().auth;
      if (guestId) {
        try {
          // Use the standalone merge function instead of importing from cartSlice
          await mergeCartAPI({ 
            guestId, 
            userId: response.data.user._id,
            token: response.data.token
          });
          
          // Clear guestId from localStorage after successful merge
          localStorage.removeItem("guestId");
          
          // Dispatch an action to update the auth state (guestId removal)
          dispatch(authSlice.actions.clearGuestId());
          
        } catch (mergeError) {
          console.warn('Cart merge failed:', mergeError);
          // Continue with login even if merge fails, but still clear guestId
          localStorage.removeItem("guestId");
          dispatch(authSlice.actions.clearGuestId());
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      // Merge guest cart into user cart after successful registration
      const { guestId } = getState().auth;
      if (guestId) {
        try {
          // Use the standalone merge function instead of importing from cartSlice
          await mergeCartAPI({ 
            guestId, 
            userId: response.data.user._id,
            token: response.data.token
          });
          
          // Clear guestId from localStorage after successful merge
          localStorage.removeItem("guestId");
          
          // Dispatch an action to update the auth state (guestId removal)
          dispatch(authSlice.actions.clearGuestId());
          
        } catch (mergeError) {
          console.warn('Cart merge failed:', mergeError);
          // Continue with registration even if merge fails, but still clear guestId
          localStorage.removeItem("guestId");
          dispatch(authSlice.actions.clearGuestId());
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Registration failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
    clearGuestId: (state) => {
      state.guestId = null;
      localStorage.removeItem("guestId");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // guestId is cleared in the thunk logic above
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // guestId is cleared in the thunk logic above
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      });
  },
});

export const { logout, generateNewGuestId, clearGuestId } = authSlice.actions;
export default authSlice.reducer;