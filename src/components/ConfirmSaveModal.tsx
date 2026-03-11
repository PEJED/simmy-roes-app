import React from 'react';

interface ConfirmSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: () => void;
  onSaveAsNew: () => void;
}

const ConfirmSaveModal: React.FC<ConfirmSaveModalProps> = ({ isOpen, onClose, onConfirmSave, onSaveAsNew }) => {
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
          <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg leading-tight">Προσοχή</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 font-medium">
          Έχετε αλλάξει κατεύθυνση ή ροές σε σχέση με το αρχικό αρχείο. Είστε σίγουροι ότι θέλετε να αποθηκεύσετε τις αλλαγές στο τρέχον αρχείο ή θέλετε να δημιουργήσετε ένα νέο;
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirmSave}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm"
          >
            Αποθήκευση στο τρέχον
          </button>
          <button
            onClick={onSaveAsNew}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Δημιουργία νέου αρχείου
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-bold transition-colors"
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSaveModal;
