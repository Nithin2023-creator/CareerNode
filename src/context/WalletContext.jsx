import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi } from '../lib/api';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = localStorage.getItem('careernode_shared_wallet');
      return saved ? JSON.parse(saved) : { balance: 0, transactions: [] };
    } catch {
      return { balance: 0, transactions: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('careernode_shared_wallet', JSON.stringify(wallet));
  }, [wallet]);

  const refreshWallet = useCallback(async () => {
    try {
      const data = await walletApi.getWallet();
      if (data) setWallet(data);
      return data;
    } catch {
      console.warn('Failed to fetch wallet from backend, using local fallback');
      return null;
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  // Optimistically bump the balance, then reconcile with the backend.
  const addCredits = useCallback(async (amount, description) => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [
        {
          id: Date.now().toString(),
          type: 'purchase',
          description,
          credits: amount,
          balanceAfter: prev.balance + amount,
          date: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));
    await refreshWallet();
  }, [refreshWallet]);

  const spendCredits = useCallback(async (amount, description) => {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      transactions: [
        {
          id: Date.now().toString(),
          type: 'spend',
          description,
          credits: amount,
          balanceAfter: prev.balance - amount,
          date: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));
    await refreshWallet();
  }, [refreshWallet]);

  return (
    <WalletContext.Provider value={{ wallet, addCredits, spendCredits, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
