import React, { createContext, useContext, useState } from 'react';

const IntroVisibilityContext = createContext(null);

export function IntroVisibilityProvider({ children }) {
  const [inlineIntroOpen, setInlineIntroOpen] = useState(false);

  return (
    <IntroVisibilityContext.Provider value={{ inlineIntroOpen, setInlineIntroOpen }}>
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
