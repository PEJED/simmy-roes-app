import React, { useEffect } from 'react';
import type { Course } from '../types/Course';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
               {course.flow}
             </span>
             <h2 className="text-2xl font-bold text-gray-900 leading-tight">
               {course.title}
             </h2>
             <p className="text-sm text-gray-500 mt-1">Κωδικός: {course.id} • Εξάμηνο: {course.semester}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Professors Section */}
          {course.professors && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Διδάσκοντες
              </h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {course.professors}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Περιγραφή</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
             <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 font-medium uppercase">ECTS</span>
                <span className="text-lg font-bold text-gray-900">{course.ects}</span>
             </div>
             <div className="bg-gray-50 p-3 rounded-lg">
                <span className="block text-xs text-gray-500 font-medium uppercase">Ώρες Διδασκαλίας</span>
                <div className="flex gap-3 text-sm font-medium text-gray-800">
                    <span>Θεωρία: {course.lecture_hours || 0}h</span>
                    <span>Εργαστήριο: {course.lab_hours || 0}h</span>
                </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Κλείσιμο
          </button>
        </div>

      </div>
    </div>
  );
};

export default CourseModal;
