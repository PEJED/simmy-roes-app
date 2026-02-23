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
    'Y': 'bg-blue-100 text-blue-800 border-blue-200',
    'L': 'bg-green-100 text-green-800 border-green-200',
    'D': 'bg-purple-100 text-purple-800 border-purple-200',
    'H': 'bg-amber-100 text-amber-800 border-amber-200',
    'T': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'E': 'bg-red-100 text-red-800 border-red-200',
    'Z': 'bg-orange-100 text-orange-800 border-orange-200',
    'S': 'bg-pink-100 text-pink-800 border-pink-200',
    'X': 'bg-rose-100 text-rose-800 border-rose-200',
    'F': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'M': 'bg-teal-100 text-teal-800 border-teal-200',
    'I': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'O': 'bg-lime-100 text-lime-800 border-lime-200',
    'G': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeColor = (course.flow_code && flowColors[course.flow_code]) || 'bg-gray-100 text-gray-600 border-gray-200';

  let flowDisplayName = course.flow;
  if (course.flow_code && FLOW_NAMES[course.flow_code]) {
      flowDisplayName = FLOW_NAMES[course.flow_code];
  }

  // Ensure passed className (for warning rings) takes precedence or merges well
  const containerClasses = `
    relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md h-full flex flex-col justify-between group
    ${isSelected
      ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20 shadow-green-100'
      : 'border-gray-200 hover:border-blue-400'
    }
    ${isDisabled ? 'opacity-70 bg-gray-50 grayscale-[0.5]' : ''}
    ${className || ''}
  `;

  return (
    <>
      <div className={containerClasses}>
        {/* Clickable Area for Details */}
        <div
           className="p-4 cursor-pointer flex-grow flex flex-col"
           onClick={() => setShowModal(true)}
           title="Κλικ για λεπτομέρειες"
        >
          <div className="flex justify-between items-start mb-2.5 gap-2">
            <h3 className={`font-bold text-sm md:text-base leading-snug line-clamp-2 ${isSelected ? 'text-green-900' : 'text-gray-800 group-hover:text-blue-700'}`}>
              {course.title}
            </h3>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border ${badgeColor}`}>
              {flowDisplayName}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
             <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                #{course.id}
             </span>
             {course.is_flow_compulsory && (
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  Υποχρεωτικό Ροής
                </span>
             )}
          </div>

          <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-50">
             <div className="flex flex-col gap-1">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  Εξάμηνο {course.semester}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                       {course.ects} ECTS
                    </span>
                    {(course.lecture_hours || course.lab_hours) ? (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1" title="Ώρες Θεωρίας / Εργαστηρίου">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           {course.lecture_hours || 0}Θ / {course.lab_hours || 0}Ε
                        </span>
                    ) : null}
                </div>
             </div>

             <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
          <div className="w-full relative group/tooltip">
            <button
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(course);
              }}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                  : isSelected
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-red-100'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue-200'
                }`}
            >
              {isDisabled ? (
                 <>
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                   <span>Κλειδωμένο</span>
                 </>
              ) : isSelected ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span>Αφαίρεση</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>Επιλογή</span>
                </>
              )}
            </button>

            {/* Tooltip for Disabled State */}
            {isDisabled && tooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-800/95 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all z-20 pointer-events-none text-center leading-relaxed backdrop-blur-sm">
                {tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800/95"></div>
              </div>
            )}
          </div>
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
