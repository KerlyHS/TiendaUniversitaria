import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, actionText, actionUrl, type = 'success' }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, actionText, actionUrl, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="bg-white border border-outline-variant shadow-lg rounded-DEFAULT p-4 w-80 flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <CheckCircle size={18} className="text-primary-fixed-dim" />
                <span>{toast.title}</span>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-on-surface-variant hover:text-on-surface">
                <X size={16} />
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant pl-6">{toast.message}</p>
            {toast.actionText && toast.actionUrl && (
              <div className="pl-6 mt-1">
                <Link 
                  to={toast.actionUrl} 
                  className="text-body-sm font-bold text-primary hover:text-primary-container flex items-center gap-1"
                  onClick={() => removeToast(toast.id)}
                >
                  <ShoppingCart size={14} />
                  {toast.actionText}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
