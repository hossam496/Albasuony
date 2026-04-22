import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Sync local state from cart items array
  const syncState = (items) => {
    setCartItems(items);
    setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
    setCartTotal(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  };

  // Load cart from API when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart state when logged out
      syncState([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setIsCartLoading(true);
    try {
      const { data } = await cartAPI.get();
      syncState(data.cart?.items || []);
    } catch {
      syncState([]);
    } finally {
      setIsCartLoading(false);
    }
  };

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!isAuthenticated) return;
    try {
      const productId = product._id || product.id;
      const { data } = await cartAPI.add(productId, quantity);
      syncState(data.cart?.items || []);
    } catch (error) {
      throw error;
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const { data } = await cartAPI.remove(itemId);
      syncState(data.cart?.items || []);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    try {
      const { data } = await cartAPI.update(itemId, newQuantity);
      syncState(data.cart?.items || []);
    } catch (error) {
      throw error;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clear();
      syncState([]);
    } catch {
      syncState([]);
    }
  }, []);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isCartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};