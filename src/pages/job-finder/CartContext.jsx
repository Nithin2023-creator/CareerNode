import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { wallet, addCredits, spendCredits, refreshWallet } = useWallet();
  // Load initial state from localStorage if available
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('jf_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('jf_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (company) => {
    if (cart.find(item => item.id === company.id)) {
      return; // Already in cart
    }
    setCart(prev => [...prev, company]);
  };

  const removeFromCart = (companyId) => {
    setCart(prev => prev.filter(item => item.id !== companyId));
  };

  const clearCart = () => {
    setCart([]);
  };



  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      wallet,
      addCredits,
      spendCredits,
      refreshWallet
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
