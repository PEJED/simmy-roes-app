import React, { useState, memo } from 'react';
import type { Course } from '../types/Course';
import { FLOW_NAMES } from '../utils/flowValidation';
import CourseModal from './CourseModal';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
  isDisabled?: boolean;
  tooltip?: string;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = memo(({ course, isSelected, onToggle, isDisabled, tooltip, className }) => {
  const [showModal, setShowModal] = useState(false);

  const flowColors: Record<string, string> = {
    'K': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'Y': 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'L': 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    'D': 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'H': 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'T': 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'E': 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    'Z': 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'S': 'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'X': 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'F': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'M': 'bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'I': 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'O': 'bg-lime-100 dark:bg-lime-900/40 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800',
    'G': 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    'P': 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  };

  const badgeColor = (course.flow_code && flowColors[course.flow_code]) || 'bg-gray-100 text-gray-600 border-gray-200';

  let flowDisplayName = course.flow;
  if (course.flow_code && FLOW_NAMES[course.flow_code]) {
      flowDisplayName = FLOW_NAMES[course.flow_code];
  }

  // Ensure passed className (for warning rings) takes precedence or merges well
  // If className is provided, it handles its own border and bg. Otherwise use the default unselected styles.
  const containerClasses = `
    relative rounded-2xl transition-all duration-300 flex flex-col group cursor-pointer
    ${isSelected
      ? 'border-green-500 bg-green-50/30 dark:bg-green-900/20 ring-4 ring-green-500/10 dark:ring-green-900/20 shadow-green-100/50 dark:shadow-green-900/20 scale-[1.01] border-2 shadow-sm'
      : (className ? className : 'border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-500/80 hover:shadow-md hover:bg-gray-50/50 dark:hover:bg-gray-750 border-2 shadow-sm')
    }
    ${isDisabled ? 'opacity-60 bg-gray-50 dark:bg-gray-900 grayscale-[0.5] cursor-not-allowed hover:border-gray-200 dark:hover:border-gray-700 hover:scale-100 hover:shadow-none' : ''}
  `;

  return (
    <>
      <div
        id={`course-${course.id}`}
        className={containerClasses}
        onClick={() => {
          if (!isDisabled) {
            onToggle(course);
          }
        }}
      >
        {/* Selected Checkmark Icon Badge */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 shadow-md border-2 border-white z-10 animate-in zoom-in duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        )}

        <div className="p-3 sm:p-3.5 flex-grow flex flex-col sm:flex-row items-start sm:items-center justify-between w-full relative gap-3">

          {/* Left Side: Title and Tags */}
          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <h3 className={`font-bold text-sm md:text-base leading-snug pr-8 sm:pr-0 ${isSelected ? 'text-green-900 dark:text-green-400' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-800 dark:group-hover:text-blue-400'}`}>
              {course.title}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
               <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border ${badgeColor}`}>
                  {flowDisplayName}
               </span>
               <span className="font-mono text-[9px] text-gray-400 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-1.5 py-0.5 rounded">
                  #{course.id}
               </span>
               {course.is_flow_compulsory && (
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50">
                    Υποχρ.
                  </span>
               )}
            </div>
          </div>

          {/* Right Side: Semester, ECTS, Info Button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/60 dark:border-gray-700/60">
             <div className="flex items-center gap-3">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Εξάμηνο</span>
                  <span className="text-xs font-black text-gray-700 dark:text-gray-200">{course.semester}</span>
                </div>
                <div className="h-5 w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                       {course.ects} <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase">ECTS</span>
                    </span>
                </div>
             </div>

             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowModal(true);
               }}
               className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-full transition-colors shrink-0 z-30"
               title="Λεπτομέρειες"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </button>
          </div>

          {/* Tooltip for Disabled State overlaying the card */}
          {isDisabled && tooltip && (
            <div className="absolute inset-0 z-20 hidden group-hover:flex items-center justify-center bg-gray-900/10 dark:bg-black/40 backdrop-blur-[1px] rounded-2xl pointer-events-none">
              <div className="bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 text-xs font-medium py-2 px-4 rounded-lg shadow-xl mx-4 text-center leading-relaxed border border-gray-700 dark:border-gray-600">
                <svg className="w-5 h-5 mx-auto mb-1 text-gray-300 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
         <CourseModal
            course={course}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
         />
      )}
    </>
  );
});

export default CourseCard;
