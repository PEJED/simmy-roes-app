import React from 'react';

interface ConfirmRestartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveAndConfirm: () => void;
}

const ConfirmRestartModal: React.FC<ConfirmRestartModalProps> = ({ isOpen, onClose, onConfirm, onSaveAndConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full"
        style={{ animation: 'modalIn 0.18s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg leading-tight">Επαναφορά</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium">
          Είστε σίγουροι ότι θέλετε να ξεκινήσετε από την αρχή; Όλες οι τρέχουσες μη αποθηκευμένες επιλογές σας θα χαθούν.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onSaveAndConfirm}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm"
          >
            Αποθήκευση και Εκκαθάριση
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Εκκαθάριση Χωρίς Αποθήκευση
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-bold transition-colors mt-1"
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRestartModal;
