import React, { createContext, useCallback, useContext, useState } from 'react';
import PaywallModal from '../components/payments/PaywallModal';

const PaywallContext = createContext(null);

/**
 * Provides a single app-wide paywall. Any component can call
 * `const openPaywall = usePaywall()` and trigger the unified payment overlay
 * with `openPaywall({ actionId, label, creditCost, cashPrice, onPayWithCredits, onPayAlaCarte })`.
 */
export const PaywallProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const openPaywall = useCallback((cfg) => {
    setConfig(cfg);
  }, []);

  const closePaywall = useCallback(() => {
    setConfig(null);
  }, []);

  return (
    <PaywallContext.Provider value={openPaywall}>
      {children}
      <PaywallModal config={config} onClose={closePaywall} />
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const ctx = useContext(PaywallContext);
  if (!ctx) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return ctx;
};
