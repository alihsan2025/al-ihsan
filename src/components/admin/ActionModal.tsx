import React from 'react';
import { Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';

export type ActionModalState = 'HIDDEN' | 'CONFIRMATION' | 'LOADING' | 'SUCCESS' | 'ERROR';

interface ActionModalProps {
  isOpen: boolean;
  state: ActionModalState;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  successMessage?: string;
  errorMessage?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  state,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  successMessage = 'Action completed successfully!',
  errorMessage = 'An error occurred. Please try again.',
  isDanger = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || state === 'HIDDEN') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        {state === 'CONFIRMATION' && (
          <div className="p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDanger 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' 
                : 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
            }`}>
              <AlertTriangle strokeWidth={2.5} size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-[280px]">
              {message}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 font-bold rounded-xl transition-colors text-white ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        )}

        {state === 'LOADING' && (
          <div className="p-8 pb-10 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Processing Action</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while the database updates and notifications are sent.</p>
          </div>
        )}

        {state === 'SUCCESS' && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-4 scale-in-center">
              <CheckCircle strokeWidth={2.5} size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Success!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-transform active:scale-95"
            >
              Close
            </button>
          </div>
        )}

        {state === 'ERROR' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-in-center">
              <X strokeWidth={2.5} size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Update Failed</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {errorMessage}
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
