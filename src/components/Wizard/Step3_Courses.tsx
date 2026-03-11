import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { calculateDetailedStats } from '../../utils/ruleEngine';
import { FLOW_RULES } from '../../data/flowRules';
import { evaluateRules } from '../../utils/ruleEvaluator';
import SemesterSection from './SemesterSection';

// 6 visually distinct warm-tone palettes for rule warnings (light + dark variants each)
const COLORS = [
    // 1. Standard Orange
    'border-orange-400 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/35 text-orange-900 dark:text-orange-300',
    // 2. Deep Amber
    'border-amber-500 dark:border-amber-700 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300',
    // 3. Yellow-Orange (warm saffron)
    'border-yellow-400 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-300',
    // 4. Burnt Red-Orange
    'border-red-400 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300',
    // 5. Deep Gold / Saffron
    'border-amber-600 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/25 text-amber-800 dark:text-amber-200',
    // 6. Soft Peach / Light Coral
    'border-orange-300 dark:border-orange-700 bg-orange-100/60 dark:bg-orange-800/25 text-orange-800 dark:text-orange-400',
];

interface Step3CoursesProps {
  onSaveRequest?: () => void;
}

const Step3Courses: React.FC<Step3CoursesProps> = ({ onSaveRequest }) => {
  const { direction, flowSelections, selectedCourseIds, toggleCourse, setStep, lockedCourseIds, activeProfileId, updateProfile } = useWizard();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
              setIsSearchFocused(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manage Expanded State at Top Level
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      '6-comp': true, '6-flow': true, '6-free': false,
      '7-comp': true, '7-flow': true, '7-free': false,
      '8-comp': true, '8-flow': true, '8-free': false,
      '9-comp': true, '9-flow': true, '9-free': false,
  });

  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const toggleSection = useCallback((sem: number, section: string) => {
      setExpandedSections(prev => ({ ...prev, [`${sem}-${section}`]: !prev[`${sem}-${section}`] }));
  }, []);

  const ruleStatuses = useMemo(() => {
    return evaluateRules(selectedCourseIds, flowSelections, direction);
  }, [selectedCourseIds, flowSelections, direction]);

  const ruleColors = useMemo(() => {
      const colors: Record<string, string> = {};
      ruleStatuses.forEach((r, idx) => {
          colors[r.ruleId] = COLORS[idx % COLORS.length];
      });
      return colors;
  }, [ruleStatuses.length]);

  const detailedStats = useMemo(() => {
    const selected = courses.filter(c => selectedCourseIds.includes(String(c.id)));
    return calculateDetailedStats(selected, direction, flowSelections);
  }, [selectedCourseIds, flowSelections, direction]);

  const satisfiedFlows = useMemo(() => {
      const set = new Set<string>();
      if (detailedStats && detailedStats.flowStats) {
          Object.entries(detailedStats.flowStats).forEach(([flowCode, stat]) => {
              if (stat.isComplete) {
                  set.add(flowCode);
              }
          });
      }
      return set;
  }, [detailedStats.flowStats]);

  const generalWarnings = detailedStats.warnings;

  const sidebarWarnings = useMemo(() => {
      return generalWarnings.filter(w => !w.includes('Υπέρβαση ορίου μαθημάτων') && !w.includes('>7'));
  }, [generalWarnings]);

  const isComplete = generalWarnings.length === 0;

  const semanticRules = useMemo(() => {
      const activeFlowCodes = Object.keys(flowSelections).filter(k => flowSelections[k] !== 'none');
      return ruleStatuses.filter(r => {
          if (!r.flowCode) return true;
          if (r.flowCode === 'P') return true;
          return activeFlowCodes.includes(r.flowCode);
      });
  }, [ruleStatuses, flowSelections]);

  const getCourseCategory = useCallback((course: typeof courses[0]) => {
    if (course.flow_code === 'P') return 'compulsory';
    
    const flowSel = flowSelections[course.flow_code as string];
    if (flowSel && flowSel !== 'none') {
        let rule = FLOW_RULES[course.flow_code as string]?.[flowSel];
        if (typeof rule === 'function') rule = rule(direction);

        const id = String(course.id);
        if (rule?.compulsory?.includes(id)) return 'compulsory';
        if (rule?.options?.some(opt => opt.includes(id))) return 'compulsory';

        return 'flow_elective_and_free';
    }
    return 'free';
  }, [flowSelections, direction]);

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
          
          if (cat === 'compulsory') {
              compulsory.push(c);
          } else if (cat === 'flow_elective_and_free') {
              flow_elective.push(c);
              free.push(c);
          } else {
              free.push(c);
          }

          if (selectedCourseIds.includes(String(c.id))) {
              totalSelected++;
              totalECTS += c.ects || 0;
              totalLectureHours += c.lecture_hours || 0;
              totalLabHours += c.lab_hours || 0;
          }
      });

      const sortByFlow = (a: typeof courses[0], b: typeof courses[0]) => {
          if (a.flow_code === 'P' && b.flow_code !== 'P') return -1;
          if (a.flow_code !== 'P' && b.flow_code === 'P') return 1;
          const flowA = a.flow_code || '';
          const flowB = b.flow_code || '';
          if (flowA === flowB) return a.title.localeCompare(b.title, 'el');
          return flowA.localeCompare(flowB, 'el');
      };

      compulsory.sort(sortByFlow);
      flow_elective.sort(sortByFlow);
      free.sort(sortByFlow);

      grouped[sem] = { compulsory, flow_elective, free, totalSelected, totalECTS, totalLectureHours, totalLabHours };
    });
    return grouped;
  }, [flowSelections, direction, selectedCourseIds, getCourseCategory]);

  const searchResults = useMemo(() => {
      if (!searchTerm.trim()) return [];
      const normalizedSearch = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return courses.filter(c => {
          const normalizedTitle = c.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          // Full-text match
          if (normalizedTitle.includes(normalizedSearch)) return true;
          // Acronym/initials match: e.g. "τν" matches "Τεχνητή Νοημοσύνη"
          const acronym = normalizedTitle.split(/\s+/).map(w => w[0] || '').join('');
          return acronym.startsWith(normalizedSearch);
      }).slice(0, 8);
  }, [searchTerm]);

  const handleCourseJump = (course: typeof courses[0]) => {
      const cat = getCourseCategory(course);
      const sectionKey = cat === 'compulsory' ? 'comp' : (cat === 'flow_elective_and_free' ? 'flow' : 'free');
      
      // Expand section
      setExpandedSections(prev => ({
          ...prev,
          [`${course.semester}-${sectionKey}`]: true
      }));

      // Close search
      setSearchTerm('');
      setIsSearchFocused(false);

      // Scroll with slight delay for DOM
      setTimeout(() => {
          const el = document.getElementById(`course-${course.id}`);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('ring-4', 'ring-blue-500', 'transition-all', 'duration-500');
              setTimeout(() => {
                  el.classList.remove('ring-4', 'ring-blue-500');
              }, 1500);
          }
      }, 150);
  };

  // ruleStatuses, detailedStats, etc. moved up

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hideWarnings, setHideWarnings] = useState(false);

  const clearAllCourses = () => {
      const toRemove = selectedCourseIds.filter(id => !lockedCourseIds.includes(id));
      toRemove.forEach(id => toggleCourse(id));
      setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 lg:pb-0 transition-colors duration-300">

      {/* Confirmation Modal */}
      {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div>
                          <h4 className="font-black text-gray-900 dark:text-gray-100 text-base">Είστε σίγουροι;</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Θα αφαιρεθούν όλα τα μαθήματα που έχετε επιλέξει.</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <button
                          onClick={() => setShowClearConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                          Ακύρωση
                      </button>
                      <button
                          onClick={clearAllCourses}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-sm shadow-red-200 dark:shadow-red-900/30"
                      >
                          Εκκαθάριση
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content (Left) */}
      <div className="flex-1 p-4 lg:p-8 order-2 lg:order-1 lg:overflow-visible overflow-x-hidden">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Επιλογή Μαθημάτων</h2>
                <button
                    onClick={() => setHideWarnings(!hideWarnings)}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 shrink-0 ${
                        hideWarnings 
                        ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={hideWarnings ? "Εμφάνιση Προειδοποιήσεων" : "Απόκρυψη Προειδοποιήσεων"}
                >
                    {hideWarnings ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                    <span className="hidden sm:inline">{hideWarnings ? 'Εμφάνιση Warnings' : 'Απόκρυψη Warnings'}</span>
                </button>
                <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span className="hidden sm:inline">Εκκαθάριση Όλων</span>
                </button>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 min-w-[280px]">
                <div className="relative flex-1 max-w-sm" ref={searchWrapperRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Αναζήτηση μαθήματος..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors shadow-sm text-sm font-medium outline-none"
                    />
                    
                    {/* Clear search button (X) */}
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); setIsSearchFocused(false); }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                    {isSearchFocused && searchTerm.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchResults.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 pb-2 text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider border-b border-gray-100 dark:border-gray-750 mb-1">Αποτελεσματα</div>
                                    {searchResults.map(c => (
                                        <button
                                            key={c.id}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Prevent input blur
                                                handleCourseJump(c);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/40 border-b border-gray-50 dark:border-gray-750 last:border-0 transition-colors flex flex-col gap-1 group"
                                        >
                                            <div className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight">{c.title}</div>
                                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">Εξ. {c.semester}</span>
                                                {c.flow_code && c.flow_code !== 'X' && c.flow_code !== 'K' && (
                                                    <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 px-2 py-0.5 rounded-md">Ροη {c.flow_code}</span>
                                                )}
                                                {getCourseCategory(c) === 'compulsory' && (
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold">Υποχρεωτικο</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm font-bold text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Δεν βρέθηκαν μαθήματα
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-5 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl text-sm text-blue-900 dark:text-blue-200 flex gap-4 items-start shadow-sm backdrop-blur-sm">
             <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div className="space-y-3">
                <h4 className="font-bold text-lg">Κανόνες Ορίων</h4>
                <p>Το πλήθος των μαθημάτων <strong>ανά εξάμηνο</strong> δεν πρέπει να υπερβαίνει τα <strong>12</strong>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                    <div>
                        <span className="font-bold block mb-1 text-xs uppercase text-blue-800 dark:text-blue-300">Προτεινόμενα Όρια (βάσει Μ.Ο.):</span>
                        <ul className="list-disc list-inside text-xs space-y-1 text-blue-800/80 dark:text-blue-300/80 font-medium">
                            <li>7 για μ.ο. ≤ 8.5</li>
                            <li>8 για 8.5 &lt; μ.ο ≤ 9</li>
                            <li>9 για 9 &lt; μ.ο ≤ 9.5</li>
                            <li>10 για μ.ο. &gt; 9.5</li>
                        </ul>
                    </div>
                    <div className="text-xs italic flex items-center text-blue-700 dark:text-blue-400">
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
                       semRules={semanticRules}
                       selectedCourseIds={selectedCourseIds}
                       lockedCourseIds={lockedCourseIds}
                       toggleCourse={toggleCourse}
                       ruleColors={ruleColors}
                       expandedSections={expandedSections}
                       toggleSection={toggleSection}
                       satisfiedFlows={satisfiedFlows}
                       hideWarnings={hideWarnings}
                   />
               ) : null
           ))}
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div className={`w-full lg:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto order-1 lg:order-2 shadow-2xl lg:shadow-none z-20 custom-scrollbar ${showMobileSummary ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden lg:block'}`}>
        <div className="lg:min-h-min relative flex flex-col h-full">
            {/* Mobile close button */}
            <button
                onClick={() => setShowMobileSummary(false)}
                className="lg:hidden absolute top-0 right-0 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full z-50 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 text-sm font-bold mb-6 transition-colors group w-fit"
            >
              <span className="bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 p-1.5 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </span>
              Πίσω στη Δομή
            </button>

            <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">Σύνοψη</h3>

            {/* Real-Time Progress Bar Section */}
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-indigo-100 dark:border-indigo-800/30 rounded-2xl shadow-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 dark:bg-gray-900/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Συνολο Μαθηματων</div>
                        <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{Math.round((selectedCourseIds.length / 25) * 100)}%</div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-indigo-200/60 dark:bg-indigo-900/40 rounded-full h-2.5 mb-4 overflow-hidden">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${selectedCourseIds.length > 25 ? 'bg-red-500' : selectedCourseIds.length === 25 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`} style={{ width: `${Math.min((selectedCourseIds.length / 25) * 100, 100)}%` }}></div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black tracking-tight transition-colors ${selectedCourseIds.length > 25 ? 'text-red-500 dark:text-red-400' : selectedCourseIds.length === 25 ? 'text-emerald-500 dark:text-emerald-400' : 'text-indigo-900 dark:text-indigo-200'}`}>
                            {selectedCourseIds.length}
                        </span>
                        <span className="text-xl text-indigo-700/80 dark:text-indigo-400/80 font-medium">/ 25</span>
                    </div>
                    {selectedCourseIds.length > 25 && (
                        <div className="text-xs font-bold text-red-700 dark:text-red-400 mt-3 flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg border border-red-200 dark:border-red-900/50 animate-in fade-in zoom-in duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Υπέρβαση ορίου μαθημάτων!
                        </div>
                    )}
                </div>
            </div>

            {/* General Stats (Free, Humanities, Non-Flow) */}
            <div className="grid grid-cols-3 gap-2 mb-8">
                 <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                     <div className={`text-xl font-black leading-none ${detailedStats.freeCount > 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                         {Math.max(0, 5 - detailedStats.freeCount)}
                     </div>
                     <div className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Απομενουν</div>
                     <div className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Ελεύθερα (max 5)</div>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                     <div className={`text-xl font-black leading-none ${detailedStats.humanitiesCount > 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                         {Math.max(0, 1 - detailedStats.humanitiesCount)}
                     </div>
                     <div className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Απομενουν</div>
                     <div className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Ανθρωπιστικά (max 1)</div>
                 </div>
                 <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                     <div className={`text-xl font-black leading-none ${detailedStats.nonFlowCount > 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                         {Math.max(0, 1 - detailedStats.nonFlowCount)}
                     </div>
                     <div className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 mt-1">Απομενουν</div>
                     <div className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Εκτός Ροών (max 1)</div>
                 </div>
            </div>

            <div className="space-y-4 mb-8">
                {Object.entries(detailedStats.flowStats).map(([key, stat]) => {
                    const greekKey = FLOW_NAMES[key]?.replace(/Flow |Ροή /g, '') || key;
                    const isFlow = true;

                    if (!isFlow) return null;

                    return (
                        <div key={key} className={`p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:shadow-md transition-all ${stat.isComplete ? 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700/50'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
                                    Ροή {greekKey}
                                    {stat.isComplete && (
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                </span>
                                <div className={`flex-1 rounded-lg p-2 text-center border ${stat.missingCompulsory === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'}`}>
                                    <div className={`text-lg font-black leading-none ${stat.missingCompulsory === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {stat.missingCompulsory === 0 ? (
                                            <svg className="w-5 h-5 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        ) : stat.missingCompulsory}
                                    </div>
                                    <div className={`text-[9px] font-bold uppercase mt-1 ${stat.missingCompulsory === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} title={`Απαιτούνται ${stat.requiredCompulsory}`}>
                                       {stat.missingCompulsory === 0 ? 'ΟΛΟΚΛΗΡΩΣΗ' : 'ΑΠΟΜΕΝΟΥΝ ΥΠΟΧ.'}
                                    </div>
                                </div>
                                <div className={`flex-1 rounded-lg p-2 text-center border ${stat.missingTotal === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50'}`}>
                                    <div className={`text-lg font-black leading-none ${stat.missingTotal === 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                        {stat.missingTotal === 0 ? (
                                            <svg className="w-5 h-5 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        ) : stat.missingTotal}
                                    </div>
                                    <div className={`text-[9px] font-bold uppercase mt-1 ${stat.missingTotal === 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`} title={`Απαιτούνται συνολικά ${stat.requiredTotal}`}>
                                        {stat.missingTotal === 0 ? 'ΟΛΟΚΛΗΡΩΣΗ' : 'ΑΠΟΜΕΝΟΥΝ ΕΠΙΛ.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sidebarWarnings.length > 0 && (
              <div className="p-4 bg-orange-50/80 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl mb-6 backdrop-blur-sm">
                 <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-3 text-xs uppercase flex items-center gap-2 tracking-wider">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   Εκκρεμοτητες
                 </h4>
                 <ul className="text-xs text-orange-800 dark:text-orange-400 space-y-2 list-disc list-inside font-medium">
                   {sidebarWarnings.map((w, idx) => (
                     <li key={idx} className="leading-snug opacity-90">{w}</li>
                   ))}
                 </ul>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 pb-6 lg:pb-0 space-y-3">
               {/* Save profile button */}
               {activeProfileId ? (
                 <div className="flex items-stretch rounded-xl border-2 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 overflow-hidden shadow-sm">
                   <button
                     onClick={() => {
                        updateProfile();
                        const btn = document.getElementById('save-sidebar-btn');
                        if (btn) {
                          const oldHtml = btn.innerHTML;
                          btn.innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg> Αποθηκεύτηκε!';
                          btn.classList.add('bg-green-100', 'dark:bg-green-900/50', 'text-green-700', 'dark:text-green-300');
                          setTimeout(() => {
                            btn.innerHTML = oldHtml;
                            btn.classList.remove('bg-green-100', 'dark:bg-green-900/50', 'text-green-700', 'dark:text-green-300');
                          }, 2000);
                        }
                     }}
                     id="save-sidebar-btn"
                     className="flex-1 py-3 font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2 text-sm"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                     </svg>
                     Αποθήκευση
                   </button>
                   <div className="w-[2px] bg-indigo-200 dark:bg-indigo-800/50"></div>
                   <button
                     onClick={onSaveRequest}
                     className="px-4 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center"
                     title="Αποθήκευση ως νέο αρχείο..."
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                   </button>
                 </div>
               ) : onSaveRequest && (
                 <button
                   onClick={onSaveRequest}
                   className="w-full py-3 rounded-xl font-bold text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2 text-sm"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                   </svg>
                   Αποθήκευση Αρχείου
                 </button>
               )}
               <button
                 disabled={!isComplete}
                 className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform flex items-center justify-center gap-2
                   ${isComplete
                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 shadow-blue-200/50 dark:shadow-blue-900/20 ring-4 ring-blue-500/20 dark:ring-blue-900/30'
                     : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'}
                 `}
                 onClick={() => alert('Η επιλογή ολοκληρώθηκε επιτυχώς!')}
               >
                 <span>Ολοκλήρωση</span>
                 {isComplete && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
               </button>
            </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-40 flex items-center justify-between">
          <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Συνολο</span>
              <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black ${selectedCourseIds.length > 25 ? 'text-red-500 dark:text-red-400' : selectedCourseIds.length === 25 ? 'text-green-500 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>{selectedCourseIds.length}</span>
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500">/ 25</span>
              </div>
          </div>
          <button
              onClick={() => setShowMobileSummary(true)}
              className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-sm rounded-xl border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
              Προβολή Σύνοψης
          </button>
      </div>

    </div>
  );
};

export default Step3Courses;
