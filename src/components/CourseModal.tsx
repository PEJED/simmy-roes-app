import React, { useEffect } from 'react';
import type { Course } from '../types/Course';
import { professorLinks } from '../data/professorLinks';

interface CourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to render professors with links
  const renderProfessors = (professorsStr: string) => {
    const parts = professorsStr.split(',').map(p => p.trim());

    return parts.map((part, index) => {
      // Try to match the name without titles like (Ε.ΔΙ.Π.)
      let nameToMatch = part;
      const match = part.match(/^(.*?)\s*\(.*?\)$/);
      if (match) {
        nameToMatch = match[1].trim();
      }

      const url = professorLinks[nameToMatch];

      return (
        <span key={index}>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-400 font-medium hover:text-blue-900 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              {part}
            </a>
          ) : (
            <span className="text-blue-800 dark:text-blue-300">{part}</span>
          )}
          {index < parts.length - 1 && ", "}
        </span>
      );
    });
  };

  // Map Latin flow codes to Greek letters
  const getLocalizedFlow = (code: string | undefined, name: string) => {
    if (!code) return name;

    const mapping: Record<string, string> = {
      'L': 'Λ',
      'H': 'Η', // Greek Eta
      'Y': 'Υ',
      'D': 'Δ',
      'E': 'Ε',
      'Z': 'Ζ',
      'T': 'Τ',
      'S': 'Σ',
      'O': 'Ο',
      'I': 'Ι',
      'M': 'Μ',
      'F': 'Φ'
    };

    const letter = mapping[code] || code;
    return letter === 'Κορμός' ? 'Κορμός' : `Ροή ${letter}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content Wrapper - Rounded & Overflow Hidden */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header - Static */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-white dark:bg-gray-800 z-10 shrink-0 transition-colors duration-300">
          <div>
             <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full mb-3 inline-block uppercase tracking-wider border border-blue-100 dark:border-blue-800/50">
               {getLocalizedFlow(course.flow_code, course.flow)}
             </span>
             <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-50 leading-tight tracking-tight">
               {course.title}
             </h2>
             <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
               <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 font-mono text-xs">#{course.id}</span>
               <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
               <span>Εξάμηνο {course.semester}</span>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0 ml-4"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/30 transition-colors duration-300">

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">ECTS</span>
                <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{course.ects}</span>
             </div>
             <div className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-750 shadow-sm flex flex-col justify-center">
                <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-2 text-center">Ωρες Διδασκαλίας</span>
                <div className="flex justify-center gap-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <div className="flex flex-col items-center"><span className="text-lg">{course.lecture_hours || 0}</span><span className="text-[9px] text-gray-400 dark:text-gray-500">Θεωρία</span></div>
                    <div className="w-px h-full bg-gray-100 dark:bg-gray-700"></div>
                    <div className="flex flex-col items-center"><span className="text-lg">{course.lab_hours || 0}</span><span className="text-[9px] text-gray-400 dark:text-gray-500">Εργαστ.</span></div>
                </div>
             </div>
          </div>

          {/* Professors Section */}
          {course.professors && (
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Διδάσκοντες
              </h3>
              <p className="text-sm leading-relaxed">
                {renderProfessors(course.professors)}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Περιγραφή</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base font-medium">
              {course.description}
            </p>
          </div>

        </div>

        {/* Footer - Static */}
        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end shrink-0 transition-colors duration-300">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Κλείσιμο
          </button>
        </div>

      </div>
    </div>
  );
};

export default CourseModal;
