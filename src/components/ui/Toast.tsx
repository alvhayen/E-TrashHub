import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      const newToasts = [...prev, { id, type, message }];
      if (newToasts.length > 3) return newToasts.slice(newToasts.length - 3);
      return newToasts;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);
  const warning = useCallback((msg: string) => addToast('warning', msg), [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="#10b981" />;
      case 'error': return <AlertCircle size={20} color="#ef4444" />;
      case 'info': return <Info size={20} color="#3b82f6" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#ecfdf5';
      case 'error': return '#fef2f2';
      case 'info': return '#eff6ff';
      case 'warning': return '#fffbeb';
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#a7f3d0';
      case 'error': return '#fecaca';
      case 'info': return '#bfdbfe';
      case 'warning': return '#fde68a';
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: getBgColor(toast.type),
                border: `1px solid ${getBorderColor(toast.type)}`,
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                pointerEvents: 'auto',
                minWidth: '300px'
              }}
            >
              {getIcon(toast.type)}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-text-secondary)' }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
