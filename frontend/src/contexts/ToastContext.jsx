import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => {
          const styles =
            toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-700'
              : toast.type === 'info'
                ? 'bg-charcoal-900 text-white border-charcoal-800'
                : 'bg-charcoal-900 text-white border-brand-500';
          const Icon =
            toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl transition-all ${styles}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  toast.type === 'error' ? 'text-rose-400' : 'text-brand-400'
                }`}
              />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-white/70 hover:text-white"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
