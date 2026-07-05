import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

const VARIANTS = {
  success: { icon: CheckCircle2, accent: 'var(--color-accent-blue)' },
  error: { icon: XCircle, accent: '#e11d48' },
  info: { icon: Info, accent: 'var(--color-accent-yellow)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, d) => push(msg, 'success', d),
    error: (msg, d) => push(msg, 'error', d),
    info: (msg, d) => push(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[min(92vw,380px)]">
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, accent } = VARIANTS[t.type] || VARIANTS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white rounded-[24px] shadow-[var(--shadow-lift)] p-4 flex items-start gap-3 border border-black/5"
              >
                <div
                  className="p-1.5 rounded-full text-white flex-shrink-0"
                  style={{ backgroundColor: accent }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm font-medium text-black leading-snug pt-0.5">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-black/30 hover:text-black transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so components don't crash if used outside a provider.
    return { success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}
