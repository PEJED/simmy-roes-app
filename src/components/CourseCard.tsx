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
    relative rounded-2xl shadow-sm border-2 transition-all duration-300 h-full flex flex-col group cursor-pointer
    ${isSelected
      ? 'border-green-500 bg-green-50/30 ring-4 ring-green-500/10 shadow-green-100/50 scale-[1.02]'
      : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50'
    }
    ${isDisabled ? 'opacity-60 bg-gray-50 grayscale-[0.5] cursor-not-allowed hover:border-gray-200 hover:scale-100 hover:shadow-none' : ''}
    ${className || ''}
  `;

  return (
    <>
      <div
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

        <div className="p-5 flex-grow flex flex-col relative">

          <div className="flex justify-between items-start mb-3 gap-3">
            <h3 className={`font-bold text-base md:text-lg leading-snug line-clamp-2 ${isSelected ? 'text-green-900' : 'text-gray-800 group-hover:text-blue-800'}`}>
              {course.title}
            </h3>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0 z-10"
              title="Λεπτομέρειες"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
             <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap border ${badgeColor}`}>
                {flowDisplayName}
             </span>
             <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                #{course.id}
             </span>
             {course.is_flow_compulsory && (
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Υποχρεωτικό Ροής
                </span>
             )}
          </div>

          <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100/60">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Εξάμηνο</span>
                  <span className="text-sm font-black text-gray-700">{course.semester}</span>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                       {course.ects} <span className="text-[10px] font-bold text-gray-500 uppercase">ECTS</span>
                    </span>
                </div>
             </div>
          </div>

          {/* Tooltip for Disabled State overlaying the card */}
          {isDisabled && tooltip && (
            <div className="absolute inset-0 z-20 hidden group-hover:flex items-center justify-center bg-gray-900/10 backdrop-blur-[1px] rounded-2xl">
              <div className="bg-gray-800 text-white text-xs font-medium py-2 px-4 rounded-lg shadow-xl mx-4 text-center leading-relaxed">
                <svg className="w-5 h-5 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
