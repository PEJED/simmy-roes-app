import React, { useEffect, useRef } from 'react';
import { useWizard, type SavedProfile } from '../context/WizardContext';
import { FLOW_NAMES } from '../utils/flowValidation';

interface SavedProfilesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRequest: () => void;
}

const DIRECTION_LABELS: Record<string, string> = {
  Electronics: 'Κατεύθυνση Ηλεκτρονικής',
  Informatics: 'Κατεύθυνση Πληροφορικής',
  Communications: 'Κατεύθυνση Επικοινωνιών',
  Energy: 'Κατεύθυνση Ενέργειας',
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function ProfileCard({
  profile,
  onLoad,
  onDelete,
}: {
  profile: SavedProfile;
  onLoad: () => void;
  onDelete: () => void;
}) {
  const activeFlows = Object.entries(profile.flowSelections)
    .filter(([, v]) => v !== 'none')
    .map(([k, v]) => {
      const name = FLOW_NAMES[k]?.replace(/^(Ροή |Flow )/, '') || k;
      return { id: k, name, isHalf: v === 'half' };
    });

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">
      <button
        onClick={onLoad}
        className="w-full text-left p-4 pr-10"
      >
        {/* Name */}
        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate mb-1">{profile.name}</div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {profile.direction && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
              {DIRECTION_LABELS[profile.direction] ?? profile.direction}
            </span>
          )}
          {activeFlows.map(f => (
            <span key={f.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
              Ροή {f.name} {f.isHalf && '(Μισή)'}
            </span>
          ))}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
            {profile.selectedCourseIds.length} μαθ.
          </span>
        </div>

        {/* Date */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{formatDate(profile.createdAt)}</div>
      </button>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Διαγραφή"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const SavedProfilesSidebar: React.FC<SavedProfilesSidebarProps> = ({ isOpen, onClose, onSaveRequest }) => {
  const { savedProfiles, loadProfile, deleteProfile } = useWizard();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLoad = (id: string) => {
    loadProfile(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 z-[160] h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h2 className="font-black text-gray-900 dark:text-gray-100 text-base">Αποθηκευμένα</h2>
            {savedProfiles.length > 0 && (
              <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                {savedProfiles.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Save new button */}
        <div className="px-5 py-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => { onSaveRequest(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Αποθήκευση Τρεχουσών Επιλογών
          </button>
        </div>

        {/* Profile list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3">
          {savedProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-500 dark:text-gray-400 text-sm">Κανένα αποθηκευμένο αρχείο</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Επιλέξτε μαθήματα και αποθηκεύστε τις επιλογές σας</p>
              </div>
            </div>
          ) : (
            savedProfiles.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onLoad={() => handleLoad(profile.id)}
                onDelete={() => deleteProfile(profile.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SavedProfilesSidebar;
