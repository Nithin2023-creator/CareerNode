import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi } from '../lib/api';

const WalletContext = createContext(null);

const EMPTY_WALLET = { balance: 0, transactions: [] };

export const clearWalletCache = () => {
  localStorage.removeItem('careernode_shared_wallet');
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(EMPTY_WALLET);

  const refreshWallet = useCallback(async () => {
    const token = localStorage.getItem('cn_token');
    if (!token) {
      setWallet(EMPTY_WALLET);
      return null;
    }

    try {
      const data = await walletApi.getWallet();
      if (data) setWallet(data);
      return data;
    } catch {
      console.warn('Failed to fetch wallet from backend');
      return null;
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const addCredits = useCallback(
    async (amount, description) => {
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
    },
    [refreshWallet]
  );

  const spendCredits = useCallback(
    async (amount, description) => {
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
    },
    [refreshWallet]
  );

  return (
    <WalletContext.Provider value={{ wallet, addCredits, spendCredits, refreshWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
