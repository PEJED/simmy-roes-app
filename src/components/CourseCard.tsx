import React, { useState } from 'react';
import type { Course } from '../types/Course';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine flow badge color
  const flowColors: Record<string, string> = {
    'Κορμός': 'bg-gray-100 text-gray-800',
    'Υπολογιστές': 'bg-blue-100 text-blue-800',
    'Λογισμικό': 'bg-green-100 text-green-800',
    'Δίκτυα': 'bg-purple-100 text-purple-800',
    'Ηλεκτρονική': 'bg-yellow-100 text-yellow-800',
    'Τηλεπικοινωνίες': 'bg-indigo-100 text-indigo-800',
    'Ενέργεια': 'bg-red-100 text-red-800',
    'Συστήματα': 'bg-orange-100 text-orange-800',
    'Ανθρωπιστικά': 'bg-pink-100 text-pink-800',
    'Ελεύθερο': 'bg-teal-100 text-teal-800'
  };

  const badgeColor = flowColors[course.flow] || 'bg-gray-100 text-gray-600';

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md
        ${isSelected ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50' : 'border-gray-200 hover:border-blue-300'}
      `}
    >
      {/* Header / Summary (Always Visible) */}
      <div className="p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight pr-8">
            {course.title}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeColor}`}>
            {course.flow}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
           <div className="text-sm text-gray-500 flex gap-3">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                Εξάμηνο: {course.semester}
              </span>
           </div>

           {/* Chevron Icon for Accordion */}
           <svg
             className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
             fill="none" viewBox="0 0 24 24" stroke="currentColor"
           >
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
        </div>
      </div>

      {/* Expanded Content (Accordion) */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 animate-fade-in-down">
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {course.description}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-400">
             <span>ECTS: {course.ects}</span>
             <span>Code: {course.id}</span>
          </div>
        </div>
      )}

      {/* Action Button (Always visible at bottom) */}
      <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(course);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
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
  );
};

export default CourseCard;
