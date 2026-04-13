
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="flex border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-4 text-sm font-bold text-slate-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-gray-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-4 text-sm font-bold transition-colors ${
              isDanger 
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10' 
                : 'text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
