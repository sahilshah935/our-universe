import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'success';
  emoji: string;
}

interface LoveToastContextType {
  showLoveWarning: (message: string, emoji?: string) => void;
  showLoveSuccess: (message: string, emoji?: string) => void;
}

const LoveToastContext = createContext<LoveToastContextType | undefined>(undefined);

export const LoveToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'warning' | 'error' | 'success', emoji = '💖') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type, emoji }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const showLoveWarning = (message: string, emoji = '🥺') => {
    addToast(message, 'warning', emoji);
  };

  const showLoveSuccess = (message: string, emoji = '✨') => {
    addToast(message, 'success', emoji);
  };

  return (
    <LoveToastContext.Provider value={{ showLoveWarning, showLoveSuccess }}>
      {children}

      {/* Floating Love Toast Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-md">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className={`pointer-events-auto px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
                toast.type === 'warning'
                  ? 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-rose-200/50'
                  : toast.type === 'success'
                  ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-200/50'
                  : 'bg-white/95 border-stone-200 text-stone-900 shadow-stone-200/50'
              }`}
            >
              <span className="text-2xl shrink-0 animate-bounce">{toast.emoji}</span>
              <div className="text-xs sm:text-sm font-semibold leading-snug">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LoveToastContext.Provider>
  );
};

export const useLoveToast = () => {
  const context = useContext(LoveToastContext);
  if (!context) throw new Error('useLoveToast must be used within LoveToastProvider');
  return context;
};
