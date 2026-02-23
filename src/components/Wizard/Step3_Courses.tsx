import React, { useMemo, useState, useCallback } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { validateSelection } from '../../utils/ruleEngine';
import { FLOW_RULES } from '../../data/flowRules';
import { evaluateRules } from '../../utils/ruleEvaluator';
import SemesterSection from './SemesterSection';

// Consistent colors based on string hash or index
const COLORS = [
    'border-red-500 bg-red-50 text-red-900',
    'border-orange-500 bg-orange-50 text-orange-900',
    'border-amber-500 bg-amber-50 text-amber-900',
    'border-lime-600 bg-lime-50 text-lime-900',
    'border-emerald-600 bg-emerald-50 text-emerald-900',
    'border-cyan-600 bg-cyan-50 text-cyan-900',
    'border-blue-600 bg-blue-50 text-blue-900',
    'border-indigo-600 bg-indigo-50 text-indigo-900',
    'border-violet-600 bg-violet-50 text-violet-900',
    'border-fuchsia-600 bg-fuchsia-50 text-fuchsia-900',
    'border-rose-600 bg-rose-50 text-rose-900'
];

const Step3Courses: React.FC = () => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep, lockedCourseIds } = useWizard();

  // Manage Expanded State at Top Level to prevent resets/scroll jumps
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      '6-comp': true, '6-flow': true, '6-free': false,
      '7-comp': true, '7-flow': true, '7-free': false,
      '8-comp': true, '8-flow': true, '8-free': false,
      '9-comp': true, '9-flow': true, '9-free': false,
  });

  const toggleSection = useCallback((sem: number, section: string) => {
      setExpandedSections(prev => ({ ...prev, [`${sem}-${section}`]: !prev[`${sem}-${section}`] }));
  }, []);

  // Helper: Categorize Course
  const getCourseCategory = (course: typeof courses[0]) => {
    const flowSel = flowSelections[course.flow_code as string];
    if (flowSel && flowSel !== 'none') {
        let rule = FLOW_RULES[course.flow_code as string]?.[flowSel];
        if (typeof rule === 'function') rule = rule(direction);

        const id = String(course.id);

        // Fixed Compulsory
        if (rule?.compulsory?.includes(id)) return 'compulsory';

        // Pool or Options (treat as Flow Elective)
        const inPool = rule?.pool?.includes(id);
        const inOptions = rule?.options?.some(opt => opt.includes(id));

        if (inPool || inOptions) return 'flow_elective';

        // Fallback for flow courses not strictly in rules but having the code
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

  // Consistent Rule Colors
  const ruleColors = useMemo(() => {
      const colors: Record<string, string> = {};
      ruleStatuses.forEach((r, idx) => {
          // Assign color based on index to ensure distinctness
          colors[r.ruleId] = COLORS[idx % COLORS.length];
      });
      return colors;
  }, [ruleStatuses.length]); // Re-calc only if number of rules changes (which is rare for a set direction/flow)

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
              compRem: Math.max(0, targetComp - compSelected),
              flowRem: 0, // Simplified for UI
              freeRem: 0,
              totalReq: targetTotal
          };
      });

      // Free Stats
      let totalReqSum = 0;
      Object.values(stats).forEach(s => totalReqSum += s.totalReq);

      // Calculate max free courses allowed (23 - flow reqs)
      // Actually rule says: Max 5 free courses.
      // But also total 23.
      // 14 (Full+Full) + X.
      // This logic is handled in ruleEngine.
      // Here we just show "Selected / Max".

      return stats;
  }, [selectedCourseIds, flowSelections]);

  const clearAllCourses = () => {
      const toRemove = selectedCourseIds.filter(id => !lockedCourseIds.includes(id));
      toRemove.forEach(id => toggleCourse(id));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">

      {/* Main Content (Left) */}
      <div className="flex-1 p-4 lg:p-8 order-2 lg:order-1 lg:overflow-visible overflow-x-hidden">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Επιλογή Μαθημάτων</h2>
            <button
                onClick={clearAllCourses}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Εκκαθάριση
            </button>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-5 bg-blue-50/80 border border-blue-200 rounded-2xl text-sm text-blue-900 flex gap-4 items-start shadow-sm backdrop-blur-sm">
             <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div className="space-y-3">
                <h4 className="font-bold text-lg">Κανόνες Ορίων</h4>
                <p>Το πλήθος των μαθημάτων <strong>ανά εξάμηνο</strong> δεν πρέπει να υπερβαίνει τα <strong>12</strong>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 p-3 rounded-xl border border-blue-100/50">
                    <div>
                        <span className="font-bold block mb-1 text-xs uppercase text-blue-800">Προτεινόμενα Όρια (βάσει Μ.Ο.):</span>
                        <ul className="list-disc list-inside text-xs space-y-1 text-blue-800/80 font-medium">
                            <li>7 για μ.ο. ≤ 8.5</li>
                            <li>8 για 8.5 &lt; μ.ο ≤ 9</li>
                            <li>9 για 9 &lt; μ.ο ≤ 9.5</li>
                            <li>10 για μ.ο. &gt; 9.5</li>
                        </ul>
                    </div>
                    <div className="text-xs italic flex items-center text-blue-700">
                        Αν επιλέξετε πάνω από 7 μαθήματα σε ένα εξάμηνο, θα εμφανιστεί σχετική ειδοποίηση.
                    </div>
                </div>
             </div>
        </div>

        <div className="space-y-8 pb-20">
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
                       expandedSections={expandedSections}
                       toggleSection={toggleSection}
                   />
               ) : null
           ))}
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div className="w-full lg:w-84 bg-white border-l border-gray-200 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto order-1 lg:order-2 shadow-xl z-20 custom-scrollbar">
        <div className="lg:min-h-min">
            <button
              onClick={() => setStep(2)}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-bold mb-8 transition-colors group"
            >
              <span className="bg-gray-100 group-hover:bg-blue-100 p-1.5 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </span>
              Πίσω στη Δομή
            </button>

            <h3 className="text-xl font-black text-gray-800 mb-6 pb-2 border-b border-gray-100">Σύνοψη</h3>

            <div className="mb-8 p-6 bg-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Συνολο Μαθηματων</div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black tracking-tight ${selectedCourseIds.length > 23 ? 'text-red-400' : selectedCourseIds.length === 23 ? 'text-emerald-400' : 'text-white'}`}>
                            {selectedCourseIds.length}
                        </span>
                        <span className="text-xl text-slate-500 font-medium">/ 23</span>
                    </div>
                    {selectedCourseIds.length > 23 && (
                        <div className="text-xs font-bold text-red-400 mt-2 flex items-center gap-1 bg-red-900/30 p-1.5 rounded-lg border border-red-500/30">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Υπέρβαση ορίου!
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {Object.entries(flowStats).map(([key, stat]) => {
                    const greekKey = FLOW_NAMES[key]?.replace(/Flow |Ροή /g, '') || key;
                    const isFlow = key !== 'Free';

                    if (!isFlow) return null; // Handle free separately if needed, or included

                    return (
                        <div key={key} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-gray-800 text-sm">Ροή {greekKey}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-bold uppercase tracking-wider">
                                    {stat.totalReq === 7 ? 'Ολοκληρη' : 'Μιση'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                                    <div className="text-lg font-black text-blue-600 leading-none">{stat.compRem}</div>
                                    <div className="text-[9px] font-bold text-blue-400 uppercase mt-1">Υποχρ.</div>
                                </div>
                                <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center border border-purple-100">
                                    <div className="text-lg font-black text-purple-600 leading-none">{Math.max(0, stat.totalReq - stat.compRem)}</div>
                                    <div className="text-[9px] font-bold text-purple-400 uppercase mt-1">Συνολο</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {generalWarnings.length > 0 && (
              <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-xl mb-6 backdrop-blur-sm">
                 <h4 className="font-bold text-orange-900 mb-3 text-xs uppercase flex items-center gap-2 tracking-wider">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   Εκκρεμοτητες
                 </h4>
                 <ul className="text-xs text-orange-800 space-y-2 list-disc list-inside font-medium">
                   {generalWarnings.map((w, idx) => (
                     <li key={idx} className="leading-snug opacity-90">{w}</li>
                   ))}
                 </ul>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-6">
               <button
                 disabled={!isComplete}
                 className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform flex items-center justify-center gap-2
                   ${isComplete
                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 shadow-blue-200'
                     : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                 `}
                 onClick={() => alert('Η επιλογή ολοκληρώθηκε επιτυχώς!')}
               >
                 <span>Ολοκλήρωση</span>
                 {isComplete && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
               </button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Step3Courses;
