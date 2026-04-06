import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    error: 'bg-rose-50 border-rose-100 text-rose-800',
    info: 'bg-blue-50 border-blue-100 text-blue-800'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }[type];

  if (!isVisible) return null;

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300`}>
      <div className={`${bgColor} border rounded-2xl p-4 shadow-xl flex items-start gap-3 backdrop-blur-md`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4 opacity-50" />
        </button>
      </div>
    </div>
  );
}

// Support for multiple toasts
export function ToastContainer({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex flex-col items-center pointer-events-none p-6 gap-3">
      {toasts.map(toast => (
        <Toast 
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
