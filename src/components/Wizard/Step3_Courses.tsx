import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { validateSelection } from '../../utils/ruleEngine';
import { FLOW_RULES } from '../../data/flowRules';
import { evaluateRules } from '../../utils/ruleEvaluator';
import SemesterSection from './SemesterSection';

const COLORS = [
    'ring-red-400', 'ring-orange-400', 'ring-amber-400',
    'ring-lime-400', 'ring-emerald-400', 'ring-teal-400',
    'ring-cyan-400', 'ring-sky-400', 'ring-blue-400',
    'ring-indigo-400', 'ring-violet-400', 'ring-purple-400',
    'ring-fuchsia-400', 'ring-pink-400', 'ring-rose-400'
];

const Step3Courses: React.FC = () => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep, lockedCourseIds } = useWizard();

  // Helper: Categorize Course
  const getCourseCategory = (course: typeof courses[0]) => {
    const flowSel = flowSelections[course.flow_code as string];
    if (flowSel && flowSel !== 'none') {
        let rule = FLOW_RULES[course.flow_code as string]?.[flowSel];
        if (typeof rule === 'function') rule = rule(direction);

        const id = String(course.id);

        // Fixed Compulsory
        if (rule?.compulsory?.includes(id)) return 'compulsory';

        // Kat' Epilogin (Pool or Options)
        const inPool = rule?.pool?.includes(id);
        const inOptions = rule?.options?.some(opt => opt.includes(id));

        if (inPool || inOptions) return 'flow_elective';

        return 'flow_elective';
    }
    return 'free';
  };

  // Group Courses
  const coursesBySemester = useMemo(() => {
    const grouped: Record<number, {
        compulsory: typeof courses,
        flow_elective: typeof courses,
        free: typeof courses,
        totalSelected: number,
        totalECTS: number,
        totalLectureHours: number,
        totalLabHours: number
    }> = {};

    [6, 7, 8, 9].forEach(sem => {
      const semCourses = courses.filter(c => c.semester === sem);
      const compulsory: typeof courses = [];
      const flow_elective: typeof courses = [];
      const free: typeof courses = [];
      let totalSelected = 0;
      let totalECTS = 0;
      let totalLectureHours = 0;
      let totalLabHours = 0;

      semCourses.forEach(c => {
          const cat = getCourseCategory(c);
          if (cat === 'compulsory') compulsory.push(c);
          else if (cat === 'flow_elective') flow_elective.push(c);
          else free.push(c);

          if (selectedCourseIds.includes(String(c.id))) {
              totalSelected++;
              totalECTS += c.ects || 0;
              totalLectureHours += c.lecture_hours || 0;
              totalLabHours += c.lab_hours || 0;
          }
      });

      grouped[sem] = { compulsory, flow_elective, free, totalSelected, totalECTS, totalLectureHours, totalLabHours };
    });
    return grouped;
  }, [flowSelections, direction, selectedCourseIds]);

  // Evaluated Rules
  const ruleStatuses = useMemo(() => {
    return evaluateRules(selectedCourseIds, flowSelections, direction);
  }, [selectedCourseIds, flowSelections, direction]);

  // Assign Colors to Active Rules
  const ruleColors = useMemo(() => {
      const colors: Record<string, string> = {};
      let colorIdx = 0;
      ruleStatuses.forEach(r => {
          if (!r.isMet) {
              colors[r.ruleId] = COLORS[colorIdx % COLORS.length];
              colorIdx++;
          }
      });
      return colors;
  }, [ruleStatuses]);

  // Validation Warnings
  const generalWarnings = useMemo(() => {
    const selected = courses.filter(c => selectedCourseIds.includes(String(c.id)));
    return validateSelection(selected, direction, flowSelections);
  }, [selectedCourseIds, flowSelections, direction]);

  const isComplete = generalWarnings.length === 0;

  // Stats for Sidebar
  const flowStats = useMemo(() => {
      const stats: Record<string, { compRem: number, flowRem: number, freeRem: number, totalReq: number }> = {};

      Object.entries(flowSelections).forEach(([code, sel]) => {
          if (sel === 'none') return;
          const targetTotal = sel === 'full' ? 7 : 4;
          const targetComp = sel === 'full' ? 4 : 3;

          const selectedInFlow = courses.filter(c => c.flow_code === code && selectedCourseIds.includes(String(c.id)));

          const compSelected = selectedInFlow.filter(c => getCourseCategory(c) === 'compulsory').length;

          stats[code] = {
              compRem: Math.max(0, targetComp - compSelected), // This might be wrong for Pool flows (L, T, O)
              flowRem: Math.max(0, (targetTotal - targetComp) - 0), // Placeholder
              freeRem: 0,
              totalReq: targetTotal
          };
      });

      let totalReqSum = 0;
      Object.values(stats).forEach(s => totalReqSum += s.totalReq);
      const maxFree = Math.max(0, 23 - totalReqSum);
      const freeSelected = courses.filter(c => selectedCourseIds.includes(String(c.id)) && getCourseCategory(c) === 'free').length;

      stats['Free'] = {
          compRem: 0, flowRem: 0,
          freeRem: Math.max(0, maxFree - freeSelected),
          totalReq: maxFree
      };

      return stats;
  }, [selectedCourseIds, flowSelections]);

  const clearAllCourses = () => {
      const toRemove = selectedCourseIds.filter(id => !lockedCourseIds.includes(id));
      toRemove.forEach(id => toggleCourse(id));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">

      {/* Main Content (Left) */}
      <div className="flex-1 p-4 lg:p-8 order-2 lg:order-1">
        <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Επιλογή Μαθημάτων</h2>
            <button
                onClick={clearAllCourses}
                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-1"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Εκκαθάριση
            </button>
        </div>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 flex gap-4 items-start shadow-sm">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div className="space-y-2">
                <h4 className="font-bold text-lg">Κανόνες Ορίων</h4>
                <p>Το πλήθος των μαθημάτων <strong>ανά εξάμηνο</strong> δεν πρέπει να υπερβαίνει τα <strong>12</strong>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-white/50 p-3 rounded-lg">
                    <div>
                        <span className="font-bold block mb-1">Όρια βάσει Μ.Ο. (&gt;7 μαθήματα):</span>
                        <ul className="list-disc list-inside text-xs space-y-1 text-blue-800">
                            <li>7 για μ.ο. ≤ 8.5</li>
                            <li>8 για 8.5 &lt; μ.ο ≤ 9</li>
                            <li>9 για 9 &lt; μ.ο ≤ 9.5</li>
                            <li>10 για μ.ο. &gt; 9.5</li>
                        </ul>
                    </div>
                    <div className="text-xs italic flex items-center">
                        Αν επιλέξετε πάνω από 7 μαθήματα σε ένα εξάμηνο, θα εμφανιστεί σχετική ειδοποίηση.
                    </div>
                </div>
             </div>
        </div>

        <div className="space-y-8">
           {[6, 7, 8, 9].map(semester => (
               coursesBySemester[semester] ? (
                   <SemesterSection
                       key={semester}
                       semester={semester}
                       data={coursesBySemester[semester]}
                       semRules={ruleStatuses}
                       selectedCourseIds={selectedCourseIds}
                       lockedCourseIds={lockedCourseIds}
                       toggleCourse={toggleCourse}
                       ruleColors={ruleColors}
                   />
               ) : null
           ))}
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto order-1 lg:order-2 shadow-lg z-10 custom-scrollbar">
        <button
          onClick={() => setStep(2)}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        >
          &larr; Πίσω στη Δομή
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Σύνοψη</h3>

        <div className="mb-6 p-4 bg-gray-900 rounded-xl text-white shadow-lg">
            <div className="text-xs text-gray-400 font-bold uppercase mb-1">Συνολο Μαθηματων</div>
            <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${selectedCourseIds.length === 23 ? 'text-green-400' : 'text-white'}`}>{selectedCourseIds.length}</span>
                <span className="text-lg text-gray-500 mb-1">/ 23</span>
            </div>
            {selectedCourseIds.length > 23 && (
                <div className="text-xs text-red-400 font-bold mt-2">Υπέρβαση ορίου διπλώματος!</div>
            )}
        </div>

        <div className="space-y-6">
            {Object.entries(flowStats).map(([key, stat]) => {
                const greekKey = FLOW_NAMES[key]?.replace(/Flow |Ροή /g, '') || key;

                if (key === 'Free') {
                    return (
                        <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-700 mb-2">Ελεύθερα</h4>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Υπόλοιπο:</span>
                                <span className={stat.freeRem > 0 ? 'text-blue-600 font-bold' : 'text-green-600 font-bold'}>{stat.freeRem}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((stat.totalReq-stat.freeRem)/stat.totalReq)*100)}%` }}></div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={key} className="p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-blue-800">Ροή {greekKey}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                                {stat.totalReq} Σύνολο
                            </span>
                        </div>
                        {/* Note: Logic for remaining counts is simplified here due to complexity of rule engine */}
                        <div className="text-xs text-gray-400 italic">
                            Δείτε τις οδηγίες ανά εξάμηνο για λεπτομέρειες.
                        </div>
                    </div>
                );
            })}
        </div>

        {generalWarnings.length > 0 && (
          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
             <h4 className="font-bold text-orange-800 mb-2 text-sm flex items-center gap-2">
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
             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
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

    </div>
  );
};

export default Step3Courses;
