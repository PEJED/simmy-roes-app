import React, { useState } from 'react';
import type { Course } from '../types/Course';
import { FLOW_NAMES } from '../utils/flowValidation';
import CourseModal from './CourseModal';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onToggle }) => {
  const [showModal, setShowModal] = useState(false);

  // Determine flow badge color based on flow_code
  const flowColors: Record<string, string> = {
    'K': 'bg-gray-100 text-gray-800', // Core
    'Y': 'bg-blue-100 text-blue-800',
    'L': 'bg-green-100 text-green-800',
    'D': 'bg-purple-100 text-purple-800',
    'H': 'bg-yellow-100 text-yellow-800',
    'T': 'bg-indigo-100 text-indigo-800',
    'E': 'bg-red-100 text-red-800',
    'Z': 'bg-orange-100 text-orange-800', // Signals
    'S': 'bg-pink-100 text-pink-800', // Systems
    'X': 'bg-rose-100 text-rose-800', // Humanities
    'F': 'bg-cyan-100 text-cyan-800', // Physics
    'M': 'bg-teal-100 text-teal-800', // Math
    'I': 'bg-emerald-100 text-emerald-800', // Bio
    'O': 'bg-lime-100 text-lime-800', // Econ
  };

  const badgeColor = (course.flow_code && flowColors[course.flow_code]) || 'bg-gray-100 text-gray-600';

  // Determine display name
  let flowDisplayName = course.flow;
  if (course.flow_code && FLOW_NAMES[course.flow_code]) {
      flowDisplayName = FLOW_NAMES[course.flow_code];
  }

  return (
    <>
      <div
        className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md h-full flex flex-col justify-between
          ${isSelected ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50' : 'border-gray-200 hover:border-blue-300'}
        `}
      >
        {/* Header / Summary */}
        <div
           className="p-4 cursor-pointer flex-grow"
           onClick={() => setShowModal(true)}
           title="Κλικ για λεπτομέρειες"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight pr-4">
              {course.title}
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
              {flowDisplayName}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
             <div className="text-sm text-gray-500 flex gap-3">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                  Εξάμηνο: {course.semester}
                </span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                   ECTS: {course.ects}
                </span>
             </div>

             {/* Info Icon */}
             <div className="text-blue-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
          </div>

          {/* Professor Preview (Optional) */}
          {course.professors && (
            <div className="mt-3 text-xs text-gray-500 truncate" title={course.professors}>
               <span className="font-medium text-gray-400">Διδάσκοντες: </span>
               {course.professors}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(course);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 w-full justify-center
              ${isSelected
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
              }`}
          >
            {isSelected ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Αφαίρεση
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Επιλογή
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Portal */}
      {showModal && (
         <CourseModal
            course={course}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
         />
      )}
    </>
  );
};

export default CourseCard;
