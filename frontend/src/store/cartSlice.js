// src/store/cartSlice.js - Redux Toolkit Cart State

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../api/services';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartService.getCart();
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ product_id, quantity = 1 }, { dispatch, rejectWithValue }) => {
  try {
    await cartService.addToCart(product_id, quantity);
    dispatch(fetchCart()); // Refresh cart
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ cart_id, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await cartService.updateItem(cart_id, quantity);
    dispatch(fetchCart());
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (cart_id, { dispatch, rejectWithValue }) => {
  try {
    await cartService.removeItem(cart_id);
    dispatch(fetchCart());
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartState: (state) => {
      state.cartItems = [];
      state.total = 0;
      state.itemCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
