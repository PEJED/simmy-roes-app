import React, { useMemo, useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { validateSelection, type Direction as RuleDirection } from '../../utils/ruleEngine';

const Step3Courses: React.FC = () => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep } = useWizard();
  const [activeTab, setActiveTab] = useState<'main' | 'free'>('main');

  // Filter courses based on flow selections
  const { mainCourses, freeElectiveCourses } = useMemo(() => {
    const main: typeof courses = [];
    const free: typeof courses = [];

    courses.forEach(course => {
      // Skip semesters < 6
      if (course.semester < 6) return;

      // Check if course belongs to a selected flow
      const isSelectedFlow = course.flow_code && flowSelections[course.flow_code] && flowSelections[course.flow_code] !== 'none';

      if (isSelectedFlow) {
        main.push(course);
      } else if (['M', 'F'].includes(course.flow_code) || course.type === 'free' || course.type === 'humanities') {
        // M, F, Free, Humanities are strictly free electives
        free.push(course);
      } else {
        // Courses from other non-selected flows can also be free electives
        // But for now, let's keep it simple or allow them?
        // User said: "Add M and F... as Pool of Electives".
        // Let's include them in free for now to be flexible, or maybe just M/F/Humanities.
        // Let's include ALL non-selected flow courses in free?
        // That might be too many. Let's stick to M, F, Humanities for now.
      }
    });

    return { mainCourses: main, freeElectiveCourses: free };
  }, [flowSelections]);

  // Group by Semester
  const coursesBySemester = useMemo(() => {
    const target = activeTab === 'main' ? mainCourses : freeElectiveCourses;
    const grouped: Record<number, typeof courses> = {};

    [6, 7, 8, 9].forEach(sem => {
      grouped[sem] = target.filter(c => c.semester === sem);
    });

    return grouped;
  }, [activeTab, mainCourses, freeElectiveCourses]);

  // Validation Logic per Flow (Same as before)
  const validationStatus = useMemo(() => {
    const status: Record<string, { total: number, compulsory: number, targetTotal: number, targetCompulsory: number }> = {};

    Object.entries(flowSelections).forEach(([code, selection]) => {
      if (selection === 'none') return;
      status[code] = {
        total: 0,
        compulsory: 0,
        targetTotal: selection === 'full' ? 7 : 4,
        targetCompulsory: selection === 'full' ? 4 : 3
      };
    });

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

  // General Rules Validation
  const generalWarnings = useMemo(() => {
    const selected = courses.filter(c => selectedCourseIds.includes(String(c.id)));
    // Map Direction format (Capitalized) to RuleDirection (lowercase)
    const ruleDirection = direction ? direction.toLowerCase() as RuleDirection : null;
    return validateSelection(selected, ruleDirection);
  }, [selectedCourseIds, direction]);

  const isFlowsComplete = Object.values(validationStatus).every(s => s.total >= s.targetTotal && s.compulsory >= s.targetCompulsory);
  const isComplete = isFlowsComplete && generalWarnings.length === 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">

      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <button
          onClick={() => setStep(2)}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        >
          &larr; Πίσω στη Δομή
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Έλεγχος Ροών</h3>

        <div className="space-y-4">
          {Object.entries(validationStatus).map(([code, stat]) => {
            const isTotalMet = stat.total >= stat.targetTotal;
            const isCompMet = stat.compulsory >= stat.targetCompulsory;
            const isAllMet = isTotalMet && isCompMet;

            return (
              <div key={code} className={`p-4 rounded-xl border-2 transition-all ${isAllMet ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">{FLOW_NAMES[code]}</span>
                  {isAllMet && <span className="text-green-600 text-xs font-bold">OK</span>}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Μαθήματα:</span>
                    <span className={isTotalMet ? 'text-green-600' : 'text-orange-500'}>{stat.total}/{stat.targetTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Υποχρεωτικά:</span>
                    <span className={isCompMet ? 'text-green-600' : 'text-orange-500'}>{stat.compulsory}/{stat.targetCompulsory}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {generalWarnings.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
             <h4 className="font-bold text-orange-800 mb-2 text-sm flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               Εκκρεμότητες
             </h4>
             <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
               {generalWarnings.map((w, idx) => (
                 <li key={idx}>{w}</li>
               ))}
             </ul>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
           <div className="text-sm text-gray-500 mb-4">
             Επιλεγμένα μαθήματα: <span className="font-bold text-gray-900">{selectedCourseIds.length}</span>
           </div>
           <button
             disabled={!isComplete}
             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
               ${isComplete
                 ? 'bg-blue-600 hover:bg-blue-700'
                 : 'bg-gray-300 cursor-not-allowed'}
             `}
             onClick={() => alert('Επιτυχής Ολοκλήρωση!')}
           >
             Ολοκλήρωση
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Επιλογή Μαθημάτων</h2>

          <div className="flex bg-white rounded-lg border p-1">
             <button
               onClick={() => setActiveTab('main')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                 activeTab === 'main' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               Μαθήματα Ροών
             </button>
             <button
               onClick={() => setActiveTab('free')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                 activeTab === 'free' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               Ελεύθερα / Άλλα
             </button>
          </div>
        </div>

        <div className="space-y-12">
           {[6, 7, 8, 9].map(semester => {
             const semesterCourses = coursesBySemester[semester] || [];
             if (semesterCourses.length === 0) return null;

             return (
               <div key={semester} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                   <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">{semester}ο</span>
                   Εξάμηνο
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {semesterCourses.map(course => (
                     <CourseCard
                       key={course.id}
                       course={course}
                       isSelected={selectedCourseIds.includes(String(course.id))}
                       onToggle={(c) => toggleCourse(String(c.id))}
                     />
                   ))}
                 </div>
               </div>
             );
           })}

           {Object.values(coursesBySemester).every(arr => arr.length === 0) && (
             <div className="text-center py-12 border-2 border-dashed rounded-xl">
               <p className="text-gray-400">Δεν βρέθηκαν διαθέσιμα μαθήματα για αυτή την κατηγορία.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Step3Courses;
