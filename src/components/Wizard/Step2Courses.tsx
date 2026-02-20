import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';
import type { Course } from '../../types/Course';
import { FLOW_GREEK_LETTERS } from '../../utils/visualRules';
import { FLOW_NAMES } from '../../utils/flowValidation';

const Step2Courses: React.FC = () => {
  const { flowSelections, selectedCourseIds, toggleCourse, setStep } = useWizard();

  // Filter courses based on flow selections
  const availableCourses = useMemo(() => {
    return courses.filter((course) => {
      if (course.type === 'compulsory' || course.type === 'humanities' || course.type === 'free') {
        return true;
      }

      if (course.flow_code) {
        const selection = flowSelections[course.flow_code];
        return selection === 'half' || selection === 'full';
      }

      return false;
    });
  }, [flowSelections]);

  // Validation Logic per Flow
  const validationStatus = useMemo(() => {
    const status: Record<string, { total: number, compulsory: number, targetTotal: number, targetCompulsory: number }> = {};

    // Initialize status for selected flows
    Object.entries(flowSelections).forEach(([code, selection]) => {
      if (selection === 'none') return;

      status[code] = {
        total: 0,
        compulsory: 0,
        targetTotal: selection === 'full' ? 7 : 4,
        targetCompulsory: selection === 'full' ? 4 : 3
      };
    });

    // Count selected courses
    selectedCourseIds.forEach(id => {
      const course = courses.find(c => String(c.id) === id);
      if (course && course.flow_code && status[course.flow_code]) {
        status[course.flow_code].total++;
        if (course.is_flow_compulsory) {
          status[course.flow_code].compulsory++;
        }
      }
    });

    return status;
  }, [flowSelections, selectedCourseIds]);

  const handleToggle = (course: Course) => {
    toggleCourse(String(course.id));
  };

  const isComplete = useMemo(() => {
    return Object.values(validationStatus).every(s => s.total >= s.targetTotal && s.compulsory >= s.targetCompulsory);
  }, [validationStatus]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">

      {/* Sidebar / Status Panel */}
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <button
          onClick={() => setStep(1)}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Πίσω στις Ροές
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Πρόοδος</h3>

        <div className="space-y-4">
          {Object.entries(validationStatus).map(([code, stat]) => {
            const isTotalMet = stat.total >= stat.targetTotal;
            const isCompMet = stat.compulsory >= stat.targetCompulsory;
            const isAllMet = isTotalMet && isCompMet;

            return (
              <div key={code} className={`p-4 rounded-xl border-2 transition-all ${isAllMet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700 flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 w-6 h-6 rounded flex items-center justify-center text-xs font-serif">{FLOW_GREEK_LETTERS[code] || code}</span>
                    {FLOW_NAMES[code]}
                  </span>
                  {isAllMet && <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Σύνολο:</span>
                    <span className={`font-medium ${isTotalMet ? 'text-green-600' : 'text-orange-500'}`}>
                      {stat.total} / {stat.targetTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isTotalMet ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, (stat.total / stat.targetTotal) * 100)}%` }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Υποχρεωτικά:</span>
                    <span className={`font-medium ${isCompMet ? 'text-green-600' : 'text-orange-500'}`}>
                      {stat.compulsory} / {stat.targetCompulsory}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isCompMet ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, (stat.compulsory / stat.targetCompulsory) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
           <button
             disabled={!isComplete}
             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
               ${isComplete
                 ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                 : 'bg-gray-300 cursor-not-allowed'}
             `}
             onClick={() => alert('Η επιλογή ολοκληρώθηκε επιτυχώς! (Demo End)')}
           >
             Ολοκλήρωση
           </button>
           {!isComplete && <p className="text-xs text-center text-gray-400 mt-2">Συμπληρώστε τα απαιτούμενα μαθήματα</p>}
        </div>
      </div>

      {/* Main Content: Course Grid */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="flex justify-between items-end mb-6">
           <div>
             <h2 className="text-3xl font-bold text-gray-900">Επιλογή Μαθημάτων</h2>
             <p className="text-gray-500 mt-1">Επιλέξτε τα μαθήματα για κάθε ροή.</p>
           </div>
           <div className="text-sm font-medium bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
             {selectedCourseIds.length} Επιλεγμένα
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          {availableCourses.length > 0 ? (
            availableCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isSelected={selectedCourseIds.includes(String(course.id))}
                onToggle={handleToggle}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed rounded-xl">
               Δεν βρέθηκαν μαθήματα.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Courses;
