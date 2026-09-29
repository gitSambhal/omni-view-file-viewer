/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { ToastMessage } from '../types/file';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-5 z-[100001] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => {
        let icon = <Info className="w-4.5 h-4.5 text-primary shrink-0" />;

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />;
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />;
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl border border-border bg-card text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.16)] flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-xs text-foreground">{toast.title}</h5>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
