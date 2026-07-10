import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasSeenWelcomeCredits, markWelcomeCreditsSeen } from '../lib/onboardingState';
import { useWallet } from './WalletContext';

const WelcomeCreditsContext = createContext(null);

export const WelcomeCreditsProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeAmount, setWelcomeAmount] = useState(50);
  const { wallet, loading } = useWallet();

  useEffect(() => {
    // Only proceed if wallet is loaded and user hasn't seen the modal yet
    if (loading || hasSeenWelcomeCredits()) return;

    let shouldShow = false;
    let amount = 50;

    // 1. Primary Check: Did auth store a flag indicating this is a new signup?
    if (sessionStorage.getItem('cn_is_new_user') === '1') {
      shouldShow = true;
      const storedAmount = sessionStorage.getItem('cn_welcome_credits');
      if (storedAmount) amount = parseInt(storedAmount, 10);
    } 
    // 2. Fallback Check: Does the user have a 'grant' transaction from 'signup'?
    else if (wallet?.transactions) {
      const grantTx = wallet.transactions.find(tx => tx.type === 'grant' && tx.source === 'signup');
      if (grantTx) {
        shouldShow = true;
        amount = grantTx.credits;
      }
    }

    if (shouldShow) {
      setWelcomeAmount(amount);
      setIsOpen(true);
    } else {
      // If we determined they are not new, just mark it seen so we don't check again
      markWelcomeCreditsSeen();
    }
  }, [wallet, loading]);

  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    setIsOpen(false);
    markWelcomeCreditsSeen();
    sessionStorage.removeItem('cn_is_new_user');
    sessionStorage.removeItem('cn_welcome_credits');
  };

  return (
    <WelcomeCreditsContext.Provider value={{ isOpen, openModal, closeModal, welcomeAmount }}>
      {children}
    </WelcomeCreditsContext.Provider>
  );
};

export const useWelcomeCredits = () => {
  const context = useContext(WelcomeCreditsContext);
  if (!context) {
    throw new Error('useWelcomeCredits must be used within a WelcomeCreditsProvider');
  }
  return context;
};
