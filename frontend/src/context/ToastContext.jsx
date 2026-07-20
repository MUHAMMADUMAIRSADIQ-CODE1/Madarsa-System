import { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const addToast = useCallback((message, type = 'success') => {
    const options = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored"
    };
    if (type === 'success') {
      toast.success(message, options);
    } else if (type === 'error') {
      toast.error(message, options);
    } else if (type === 'warning') {
      toast.warn(message, options);
    } else {
      toast.info(message, options);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

