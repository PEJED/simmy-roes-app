import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';
import { validateSelection } from '../../utils/ruleEngine';
import { FLOW_RULES } from '../../data/flowRules';

const Step3Courses: React.FC = () => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep, lockedCourseIds } = useWizard();

  // Helper to check if a course is a "Compulsory Candidate"
  const isCompulsoryCandidate = (course: typeof courses[0], flowSelection: 'full' | 'half' | 'none') => {
    if (flowSelection === 'none') return false;

    // Get rule
    let rule = FLOW_RULES[course.flow_code as string]?.[flowSelection];
    if (typeof rule === 'function') {
        rule = rule(direction);
    }

    if (!rule) return false;

    const id = String(course.id);

    // Check compulsory list
    if (rule.compulsory?.includes(id)) return true;

    // Check pool
    if (rule.pool?.includes(id)) return true;

    // Check options
    if (rule.options) {
        return rule.options.some(optGroup => optGroup.includes(id));
    }

    return false;
  };

  const getCourseCategory = (course: typeof courses[0]) => {
    const flowSel = flowSelections[course.flow_code as string];

    if (flowSel && flowSel !== 'none') {
        if (isCompulsoryCandidate(course, flowSel)) return 'compulsory';
        return 'flow_elective';
    }
    return 'free';
  };

  const coursesBySemester = useMemo(() => {
    const grouped: Record<number, { compulsory: typeof courses, flow_elective: typeof courses, free: typeof courses, totalSelected: number }> = {};

    [6, 7, 8, 9].forEach(sem => {
      const semCourses = courses.filter(c => c.semester === sem);

      const compulsory: typeof courses = [];
      const flow_elective: typeof courses = [];
      const free: typeof courses = [];
      let totalSelected = 0;

      semCourses.forEach(c => {
          const cat = getCourseCategory(c);
          if (cat === 'compulsory') compulsory.push(c);
          else if (cat === 'flow_elective') flow_elective.push(c);
          else free.push(c);

          if (selectedCourseIds.includes(String(c.id))) {
              totalSelected++;
          }
      });

      grouped[sem] = { compulsory, flow_elective, free, totalSelected };
    });

    return grouped;
  }, [flowSelections, direction, selectedCourseIds]);

  // Validation Logic (General)
  const generalWarnings = useMemo(() => {
    const selected = courses.filter(c => selectedCourseIds.includes(String(c.id)));
    return validateSelection(selected, direction, flowSelections);
  }, [selectedCourseIds, flowSelections, direction]);

  const isComplete = generalWarnings.length === 0;

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

        <h3 className="text-xl font-bold text-gray-800 mb-4">Έλεγχος Επιλογών</h3>

        {/* Info Text */}
        <div className="mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-2">
            <p className="font-bold">Μέγιστος αριθμός μαθημάτων</p>
            <p>Το πλήθος των μαθημάτων δεν πρέπει να υπερβαίνει τα 12.</p>
            <ul className="list-disc list-inside pl-1 space-y-1 text-[10px]">
                <li>7 για μ.ο. ≤ 8.5</li>
                <li>8 για 8.5 &lt; μ.ο ≤ 9</li>
                <li>9 για 9 &lt; μ.ο ≤ 9.5</li>
                <li>10 για μ.ο. &gt; 9.5</li>
            </ul>
            <p className="italic opacity-75">
                (Εμφανίζεται μήνυμα αν επιλέξετε &gt;7/εξάμηνο)
            </p>
        </div>

        <div className="space-y-2">
             <div className="flex justify-between text-sm font-medium">
                <span>Σύνολο:</span>
                <span className={selectedCourseIds.length > 12 ? 'text-red-600' : 'text-gray-900'}>
                    {selectedCourseIds.length} / 12
                </span>
             </div>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Επιλογή Μαθημάτων</h2>

        <div className="space-y-12">
           {[6, 7, 8, 9].map(semester => {
             const data = coursesBySemester[semester];
             if (!data) return null;

             const blockFurther = data.totalSelected > 7;

             return (
               <div key={semester} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        <span className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">{semester}ο</span>
                        Εξάμηνο
                    </h3>
                    <div className="text-sm text-gray-500">
                        Επιλεγμένα: <span className={blockFurther ? 'text-red-600 font-bold' : 'font-medium'}>{data.totalSelected}</span>
                    </div>
                 </div>

                 {/* Warning Banner */}
                 {blockFurther && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                         <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                         <div>
                             <strong>Υπέρβαση ορίου μαθημάτων εξαμήνου (&gt;7).</strong>
                             <p className="text-xs mt-1">Δείτε τους κανόνες ορίου βάσει Μ.Ο. στο πλάι.</p>
                         </div>
                     </div>
                 )}

                 {/* 1. Compulsory */}
                 {data.compulsory.length > 0 && (
                     <div className="mb-6">
                         <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-l-4 border-blue-500 pl-2">
                             Υποχρεωτικα Ροων
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                             {data.compulsory.map(c => (
                                 <CourseCard
                                     key={c.id}
                                     course={c}
                                     isSelected={selectedCourseIds.includes(String(c.id))}
                                     onToggle={(c) => toggleCourse(String(c.id))}
                                     isDisabled={
                                         // Locked via context (strict full flow logic)
                                         // OR blocked by warning (overflow) AND not currently selected
                                         lockedCourseIds.includes(String(c.id)) || (blockFurther && !selectedCourseIds.includes(String(c.id)))
                                     }
                                 />
                             ))}
                         </div>
                     </div>
                 )}

                 {/* 2. Flow Electives */}
                 {data.flow_elective.length > 0 && (
                     <div className="mb-6">
                         <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-l-4 border-indigo-400 pl-2">
                             Κατ' επιλογην Υποχρεωτικα
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                             {data.flow_elective.map(c => (
                                 <CourseCard
                                     key={c.id}
                                     course={c}
                                     isSelected={selectedCourseIds.includes(String(c.id))}
                                     onToggle={(c) => toggleCourse(String(c.id))}
                                     isDisabled={blockFurther && !selectedCourseIds.includes(String(c.id))}
                                 />
                             ))}
                         </div>
                     </div>
                 )}

                 {/* 3. Free */}
                 {data.free.length > 0 && (
                     <div className="mb-6">
                         <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-l-4 border-gray-300 pl-2">
                             Ελευθερα / Αλλα
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                             {data.free.map(c => (
                                 <CourseCard
                                     key={c.id}
                                     course={c}
                                     isSelected={selectedCourseIds.includes(String(c.id))}
                                     onToggle={(c) => toggleCourse(String(c.id))}
                                     isDisabled={blockFurther && !selectedCourseIds.includes(String(c.id))}
                                 />
                             ))}
                         </div>
                     </div>
                 )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default Step3Courses;
