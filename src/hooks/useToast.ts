import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    description: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = useCallback(
    (
      message: string,
      description?: string,
      type: 'success' | 'error' | 'info' = 'success'
    ) => {
      setToast({
        message,
        description,
        type,
        isVisible: true,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccess = useCallback(
    (message: string, description?: string) => {
      showToast(message, description, 'success');
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, description?: string) => {
      showToast(message, description || '', 'error');
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, description?: string) => {
      showToast(message, description, 'info');
    },
    [showToast]
  );

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
  };
};

