import React, { useState } from 'react';
import type { Course } from '../types/Course';
import { FLOW_NAMES } from '../utils/flowValidation';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onToggle: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isSelected, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            {flowDisplayName}
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

          {/* Hours Info */}
          {(course.lecture_hours !== undefined || course.lab_hours !== undefined) && (
            <div className="flex gap-4 mb-4 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                {course.lecture_hours !== undefined && (
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Θεωρία: {course.lecture_hours}h</span>
                    </div>
                )}
                {course.lab_hours !== undefined && course.lab_hours > 0 && (
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span>Εργαστήριο: {course.lab_hours}h</span>
                    </div>
                )}
            </div>
          )}

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
