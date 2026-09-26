import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title, message) => addToast({ title, message, type: 'success' }), [addToast]);
  const error = useCallback((title, message) => addToast({ title, message, type: 'error', duration: 6000 }), [addToast]);
  const info = useCallback((title, message) => addToast({ title, message, type: 'info' }), [addToast]);
  const realtime = useCallback((title, message) => addToast({ title, message, type: 'realtime', duration: 5000 }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, realtime }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50'
                : toast.type === 'realtime'
                ? 'bg-brand-950/95 border-brand-500/50 text-brand-100 shadow-brand-950/60 ring-1 ring-brand-500/30'
                : 'bg-surface-900/90 border-surface-700/60 text-surface-100 shadow-surface-950/50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'realtime' && <Bell className="w-5 h-5 text-brand-400 animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-accent-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>}
              {toast.message && <p className="text-xs text-surface-300 mt-0.5 break-words">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-surface-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
