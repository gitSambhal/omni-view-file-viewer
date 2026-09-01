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
    <div className="fixed bottom-12 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        let border = 'border-blue-500/30 bg-slate-900/95 text-blue-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          border = 'border-emerald-500/30 bg-slate-900/95 text-emerald-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          border = 'border-red-500/30 bg-slate-900/95 text-red-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          border = 'border-amber-500/30 bg-slate-900/95 text-amber-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${border}`}
          >
            {icon}
            <div className="flex-1">
              <h5 className="font-bold text-xs">{toast.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
