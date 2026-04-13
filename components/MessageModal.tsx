
import React from 'react';

interface MessageModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  buttonText = 'Entendido',
  type = 'info',
}) => {
  if (!isOpen) return null;

  const iconMap = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  const colorMap = {
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10',
    success: 'text-green-500 bg-green-50 dark:bg-green-900/10',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-900/10',
    error: 'text-red-500 bg-red-50 dark:bg-red-900/10',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorMap[type]}`}>
            <span className="material-symbols-outlined text-3xl">{iconMap[type]}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-4 text-sm font-bold text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
