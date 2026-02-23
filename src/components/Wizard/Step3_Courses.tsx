import React, { useMemo, useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { validateSelection } from '../../utils/ruleEngine';
import { FLOW_RULES } from '../../data/flowRules';
import { evaluateRules } from '../../utils/ruleEvaluator';

const Step3Courses: React.FC = () => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep, lockedCourseIds } = useWizard();

  // Helper: Categorize Course
  const getCourseCategory = (course: typeof courses[0]) => {
    const flowSel = flowSelections[course.flow_code as string];
    if (flowSel && flowSel !== 'none') {
        let rule = FLOW_RULES[course.flow_code as string]?.[flowSel];
        if (typeof rule === 'function') rule = rule(direction);

        const id = String(course.id);
        const isCompCandidate = rule?.compulsory?.includes(id) ||
                                rule?.pool?.includes(id) ||
                                rule?.options?.some(opt => opt.includes(id));

        return isCompCandidate ? 'compulsory' : 'flow_elective';
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
        totalHours: number
    }> = {};

    [6, 7, 8, 9].forEach(sem => {
      const semCourses = courses.filter(c => c.semester === sem);
      const compulsory: typeof courses = [];
      const flow_elective: typeof courses = [];
      const free: typeof courses = [];
      let totalSelected = 0;
      let totalECTS = 0;
      let totalHours = 0;

      semCourses.forEach(c => {
          const cat = getCourseCategory(c);
          if (cat === 'compulsory') compulsory.push(c);
          else if (cat === 'flow_elective') flow_elective.push(c);
          else free.push(c);

          if (selectedCourseIds.includes(String(c.id))) {
              totalSelected++;
              totalECTS += c.ects || 0;
              totalHours += (c.lecture_hours || 0) + (c.lab_hours || 0);
          }
      });

      grouped[sem] = { compulsory, flow_elective, free, totalSelected, totalECTS, totalHours };
    });
    return grouped;
  }, [flowSelections, direction, selectedCourseIds]);

  // Evaluated Rules
  const ruleStatuses = useMemo(() => {
    return evaluateRules(selectedCourseIds, flowSelections, direction);
  }, [selectedCourseIds, flowSelections, direction]);

  // Validation Warnings
  const generalWarnings = useMemo(() => {
    const selected = courses.filter(c => selectedCourseIds.includes(String(c.id)));
    return validateSelection(selected, direction, flowSelections);
  }, [selectedCourseIds, flowSelections, direction]);

  const isComplete = generalWarnings.length === 0;

  const isRuleRelevantToSemester = (rule: typeof ruleStatuses[0], semester: number) => {
    return rule.involvedCourseIds.some(id => {
       const c = courses.find(course => String(course.id) === id);
       return c && c.semester === semester;
    });
  };

  // Stats for Sidebar
  const flowStats = useMemo(() => {
      const stats: Record<string, { compRem: number, flowRem: number, freeRem: number, totalReq: number }> = {};

      Object.entries(flowSelections).forEach(([code, sel]) => {
          if (sel === 'none') return;
          const targetTotal = sel === 'full' ? 7 : 4;
          const targetComp = sel === 'full' ? 4 : 3;

          const selectedInFlow = courses.filter(c => c.flow_code === code && selectedCourseIds.includes(String(c.id)));
          const compSelected = selectedInFlow.filter(c => getCourseCategory(c) === 'compulsory').length;
          const flowElecSelected = selectedInFlow.filter(c => getCourseCategory(c) === 'flow_elective').length;

          stats[code] = {
              compRem: Math.max(0, targetComp - compSelected),
              flowRem: Math.max(0, (targetTotal - targetComp) - flowElecSelected),
              freeRem: 0,
              totalReq: targetTotal
          };
      });

      const freeSelected = courses.filter(c => selectedCourseIds.includes(String(c.id)) && getCourseCategory(c) === 'free').length;

      // Determine Max Free based on flow config
      let totalReqSum = 0;
      Object.values(stats).forEach(s => totalReqSum += s.totalReq);

      const maxFree = Math.max(0, 23 - totalReqSum);

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

  const SemesterSection = ({ semester, data }: { semester: number, data: typeof coursesBySemester[6] }) => {
    const [openSections, setOpenSections] = useState({ comp: true, flow: true, free: false });
    const semRules = ruleStatuses.filter(r => isRuleRelevantToSemester(r, semester));
    const isOverLimit = data.totalSelected > 7;
    const isHardLimit = data.totalSelected >= 12;

    const toggle = (key: keyof typeof openSections) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

    return (
        <div className="mb-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">{semester}ο</span>
                    <h3 className="text-lg font-bold text-gray-800">Εξάμηνο</h3>
                </div>
                <div className="flex items-center gap-4">
                    {isOverLimit && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            &gt;7 Μαθήματα
                        </span>
                    )}
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${data.totalSelected >= 12 ? 'bg-red-100 text-red-700' : 'bg-white border text-gray-600'}`}>
                        {data.totalSelected} / 12
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {semRules.map(rule => (
                    <div key={rule.ruleId} className={`p-3 rounded-lg border-l-4 text-sm flex justify-between items-center ${rule.isMet ? 'bg-green-50 border-green-500 text-green-800' : 'bg-yellow-50 border-yellow-400 text-yellow-800'}`}>
                        <span>{FLOW_NAMES[rule.flowCode]}: {rule.description}</span>
                        {rule.isMet ? (
                            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-green-700">Ολοκληρώθηκε</span>
                        ) : (
                            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-yellow-700">{rule.currentCount}/{rule.targetCount}</span>
                        )}
                    </div>
                ))}

                {data.compulsory.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('comp')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Υποχρεωτικα Ροων</span>
                            <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.comp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openSections.comp && (
                            <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.compulsory.map(c => {
                                    const id = String(c.id);
                                    const blockingRule = semRules.find(r => r.isStrict && r.isMet && r.involvedCourseIds.includes(id));
                                    const isSelected = selectedCourseIds.includes(id);

                                    let disabled = false;
                                    let tooltip = "";
                                    let extraClass = "";

                                    // Highlight involved courses in active (unmet) rules
                                    const activeRule = semRules.find(r => !r.isMet && r.involvedCourseIds.includes(id));
                                    if (activeRule) {
                                        extraClass = "ring-2 ring-yellow-400 ring-offset-2";
                                    }

                                    if (lockedCourseIds.includes(id)) {
                                        disabled = true;
                                        tooltip = "Κλειδωμένο από επιλογή ροής";
                                    } else if (!isSelected) {
                                        if (isHardLimit) {
                                            disabled = true;
                                            tooltip = "Όριο 12 μαθημάτων/εξάμηνο";
                                        } else if (blockingRule) {
                                            disabled = true;
                                            tooltip = `Κανόνας ολοκληρώθηκε: ${blockingRule.description}`;
                                        }
                                    }

                                    return (
                                        <CourseCard
                                            key={c.id}
                                            course={c}
                                            isSelected={isSelected}
                                            onToggle={() => toggleCourse(id)}
                                            isDisabled={disabled}
                                            tooltip={tooltip}
                                            className={extraClass}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {data.flow_elective.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('flow')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Κατ' επιλογην Υποχρεωτικα</span>
                            <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.flow ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openSections.flow && (
                            <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.flow_elective.map(c => {
                                    const id = String(c.id);
                                    const isSelected = selectedCourseIds.includes(id);
                                    let disabled = false;
                                    let tooltip = "";

                                    if (!isSelected && isHardLimit) {
                                        disabled = true;
                                        tooltip = "Όριο 12 μαθημάτων/εξάμηνο";
                                    }

                                    return (
                                        <CourseCard
                                            key={c.id}
                                            course={c}
                                            isSelected={isSelected}
                                            onToggle={() => toggleCourse(id)}
                                            isDisabled={disabled}
                                            tooltip={tooltip}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {data.free.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('free')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Ελευθερα / Αλλα</span>
                            <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.free ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openSections.free && (
                            <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.free.map(c => {
                                    const id = String(c.id);
                                    const isSelected = selectedCourseIds.includes(id);
                                    let disabled = false;
                                    let tooltip = "";

                                    if (!isSelected && isHardLimit) {
                                        disabled = true;
                                        tooltip = "Όριο 12 μαθημάτων/εξάμηνο";
                                    }

                                    return (
                                        <CourseCard
                                            key={c.id}
                                            course={c}
                                            isSelected={isSelected}
                                            onToggle={() => toggleCourse(id)}
                                            isDisabled={disabled}
                                            tooltip={tooltip}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between font-medium">
                <span>Σύνολο Ώρες: {data.totalHours}</span>
                <span>ECTS: {data.totalECTS}</span>
            </div>
        </div>
    );
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

        {/* Info Box */}
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
               coursesBySemester[semester] ? <SemesterSection key={semester} semester={semester} data={coursesBySemester[semester]} /> : null
           ))}
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto order-1 lg:order-2 shadow-lg z-10">
        <button
          onClick={() => setStep(2)}
          className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
        >
          &larr; Πίσω στη Δομή
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Σύνοψη</h3>

        {/* Total Progress */}
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
                            <span className="font-bold text-blue-800">{FLOW_NAMES[key]}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                                {stat.totalReq} Σύνολο
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Υποχρεωτικά (Υπόλοιπο):</span>
                                <span className={stat.compRem > 0 ? 'text-orange-500 font-bold' : 'text-green-500 font-bold'}>{stat.compRem}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Επιλογής (Υπόλοιπο):</span>
                                <span className={stat.flowRem > 0 ? 'text-blue-500 font-bold' : 'text-green-500 font-bold'}>{stat.flowRem}</span>
                            </div>
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
