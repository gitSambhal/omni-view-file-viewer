/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { useState, useCallback } from 'react';
import { ToastMessage } from '../types/file';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    duration = 4000
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, title, message, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
