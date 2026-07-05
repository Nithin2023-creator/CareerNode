import React, { createContext, useContext, useState, useEffect } from 'react';

const BundleCartContext = createContext(null);

export function BundleCartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('careernode_bundle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('careernode_bundle_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (bundle) => {
    if (cart.find(item => item._id === bundle._id)) {
      return;
    }
    setCart(prev => [...prev, bundle]);
  };

  const removeFromCart = (bundleId) => {
    setCart(prev => prev.filter(item => item._id !== bundleId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <BundleCartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </BundleCartContext.Provider>
  );
}

export function useBundleCart() {
  const context = useContext(BundleCartContext);
  if (!context) {
    throw new Error('useBundleCart must be used within a BundleCartProvider');
  }
  return context;
}
