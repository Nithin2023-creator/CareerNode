import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { markJobFinderIntroSeen } from './helpers';

const IntroVisibilityContext = createContext(null);

export function IntroVisibilityProvider({ children }) {
  const [inlineIntroOpen, setInlineIntroOpen] = useState(false);
  const dismissCallbackRef = useRef(null);

  const registerIntroDismiss = useCallback((fn) => {
    dismissCallbackRef.current = fn;
  }, []);

  const dismissIntro = useCallback(() => {
    markJobFinderIntroSeen();
    dismissCallbackRef.current?.();
    setInlineIntroOpen(false);
  }, []);

  return (
    <IntroVisibilityContext.Provider
      value={{ inlineIntroOpen, setInlineIntroOpen, registerIntroDismiss, dismissIntro }}
    >
      {children}
    </IntroVisibilityContext.Provider>
  );
}

export function useIntroVisibility() {
  const ctx = useContext(IntroVisibilityContext);
  if (!ctx) {
    throw new Error('useIntroVisibility must be used within IntroVisibilityProvider');
  }
  return ctx;
}
