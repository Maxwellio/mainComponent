import { Alert, Snackbar } from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';

type ToastSeverity = 'error' | 'success' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  severity: ToastSeverity;
}

interface ToastContextType {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'error') => {
    const newToast: ToastItem = {
      id: Date.now() + Math.random(),
      message,
      severity,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const handleClose = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[2000] flex flex-col-reverse gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const duration = toast.severity === 'success' ? 3000 : null;

          return (
            <Snackbar
              key={toast.id}
              open={true}
              autoHideDuration={duration}
              onClose={(event, reason) => {
                if (reason === 'clickaway') return;
                handleClose(toast.id);
              }}
              className="!position-static !transform-none pointer-events-auto"
              style={{ position: 'static', transform: 'none' }}
            >
              <Alert
                onClose={() => handleClose(toast.id)}
                severity={toast.severity}
                variant="filled"
                className="w-full shadow-lg rounded-lg"
              >
                {toast.message}
              </Alert>
            </Snackbar>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
  return context;
};
