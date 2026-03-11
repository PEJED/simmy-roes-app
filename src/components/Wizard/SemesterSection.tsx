import React, { memo } from 'react';
import type { Course } from '../../types/Course';
import type { RuleStatus } from '../../utils/ruleEvaluator';
import { FLOW_NAMES } from '../../utils/flowValidation';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';

interface SemesterSectionData {
    compulsory: Course[];
    flow_elective: Course[];
    free: Course[];
    totalSelected: number;
    totalECTS: number;
    totalLectureHours: number;
    totalLabHours: number;
}

interface SemesterSectionProps {
    semester: number;
    data: SemesterSectionData;
    semRules: RuleStatus[];
    selectedCourseIds: string[];
    lockedCourseIds: string[];
    toggleCourse: (id: string) => void;
    ruleColors: Record<string, string>;
    expandedSections: Record<string, boolean>;
    toggleSection: (sem: number, section: string) => void;
    satisfiedFlows?: Set<string>;
    hideWarnings?: boolean;
}

const SemesterSection: React.FC<SemesterSectionProps> = memo(({
    semester,
    data,
    semRules,
    selectedCourseIds,
    lockedCourseIds,
    toggleCourse,
    ruleColors,
    expandedSections,
    toggleSection,
    satisfiedFlows = new Set(), // Default empty set
    hideWarnings = false
}) => {

    // Updated Logic: >12 is the only strict warning for badge
    const isHardLimit = data.totalSelected >= 12;

    const isOpen = (sec: string) => !!expandedSections[`${semester}-${sec}`];

    const scrollToCourse = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(`course-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-blue-500', 'transition-all', 'duration-500');
            setTimeout(() => {
                el.classList.remove('ring-4', 'ring-blue-500');
            }, 1500);
        } else {
            alert('Το μάθημα δεν βρίσκεται στο τρέχον εξάμηνο ή στην τρέχουσα προβολή.');
        }
    };

    const renderRuleDescription = (rule: RuleStatus) => {
        if (rule.type === 'options' || rule.type === 'pool') {
            return (
                <div className="flex flex-col gap-1.5 w-full">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{rule.description}</span>
                    <div className="flex flex-wrap gap-2 mt-0.5 items-center">
                        {rule.involvedCourseIds.map((id, idx) => {
                            const courseName = courses.find(c => String(c.id) === id)?.title || id;
                            const isSelected = selectedCourseIds.includes(id);
                            return (
                                <React.Fragment key={id}>
                                    <button
                                        onClick={(e) => scrollToCourse(id, e)}
                                        className={`text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all text-left leading-tight max-w-[200px] truncate ${
                                           isSelected 
                                           ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/70' 
                                           : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border shadow-sm hover:scale-105'
                                        }`}
                                        title={courseName}
                                    >
                                        {courseName}
                                    </button>
                                    {(rule.type === 'options' && idx < rule.involvedCourseIds.length - 1) && (
                                        <span className="text-gray-400 dark:text-gray-500 text-xs font-bold px-1">ή</span>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return <span className="font-bold text-gray-800 dark:text-gray-200">{rule.description}</span>;
    };

    const renderCourseGrid = (courses: Course[], isFlowSection: boolean = false) => (
        <div className="p-2 sm:p-3 bg-white dark:bg-gray-900 flex flex-col space-y-2 animate-in slide-in-from-top-2 duration-300">
            {courses.map(c => {
                const id = String(c.id);
                const isSelected = selectedCourseIds.includes(id);

                const blockingRule = semRules.find(r => r.isStrict && r.isMet && r.involvedCourseIds.includes(id));

                let disabled = false;
                let tooltip = "";
                let extraClass = "";

                // Highlight Active Rules (Colored Border/Ring Logic)
                const activeRule = semRules.find(r => !r.isMet && r.involvedCourseIds.includes(id));

                // XOR mutual-exclusion: disable the unchosen sibling
                const XOR_PAIR = ['3068', '3450'];
                const isXorCourse = XOR_PAIR.includes(id);
                const xorSiblingId = XOR_PAIR.find(x => x !== id);
                const xorSiblingSelected = xorSiblingId ? selectedCourseIds.includes(xorSiblingId) : false;
                const xorDisabled = isXorCourse && xorSiblingSelected && !isSelected;

                if (activeRule) {
                    // Priority 1: Active Warning (Red/Orange/etc)
                    const colorClass = ruleColors[activeRule.ruleId] || 'border-amber-400 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300';
                    const allClasses = colorClass.split(' ');
                    const borderClasses = allClasses.filter(cls => (cls.startsWith('border-') || cls.startsWith('dark:border-')) && !cls.includes('border-l') && !cls.includes('border-y') && !cls.includes('border-r')).join(' ') || 'border-amber-400 dark:border-amber-500/40';
                    const bgClasses = allClasses.filter(cls => cls.startsWith('bg-') || cls.startsWith('dark:bg-')).join(' ') || 'bg-amber-50 dark:bg-amber-500/10';
                    // Rely on CourseCard's className propagation
                    extraClass = `${borderClasses} ${bgClasses} scale-[1.01] border-2 shadow-[0_4px_10px_-4px_rgba(251,146,60,0.2)]`;
                } else if (isSelected && c.flow_code && satisfiedFlows.has(c.flow_code)) {
                    // Priority 2: Satisfied Flow (Green)
                    extraClass = `border-green-500 bg-green-50/20 border-2`;
                }

                if (lockedCourseIds.includes(id)) {
                    disabled = true;
                    tooltip = "Κλειδωμένο από επιλογή ροής (υποχρεωτικό άλλης κατεύθυνσης/ροής)";
                } else if (xorDisabled) {
                    disabled = true;
                    tooltip = "Εχετε ήδη επιλέξει το εναλλακτικό μάθημα";
                } else if (!isSelected) {
                    if (isHardLimit) {
                        disabled = true;
                        tooltip = "Οριο 12 μαθημάτων/εξάμηνο";
                    } else if (blockingRule) {
                        disabled = true;
                        tooltip = `Κανόνας ολοκληρώθηκε: ${blockingRule.description}`;
                    } else if (isFlowSection && c.flow_code && satisfiedFlows.has(c.flow_code)) {
                        disabled = true;
                        tooltip = "Η ροή έχει ήδη ολοκληρωθεί. Το μάθημα είναι πλέον διαθέσιμο στα Ελεύθερα.";
                    }
                }

                return (
                    <CourseCard
                        key={`${isFlowSection ? 'flow-' : 'free-'}${c.id}`} // Ensure unique keys if rendered twice in same semester (though technically they are in different grids, React doesn't mind unless they are siblings, but it's safer)
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
    );

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 dark:from-gray-900 to-white dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 blur-sm rounded-full opacity-20"></div>
                        <span className="relative bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-black shadow-lg shadow-blue-200 z-10">{semester}ο</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 tracking-tight">Εξάμηνο</h3>
                </div>
                <div className="flex items-center gap-3">
                    {/* Show Rose Warning if >12, Fuchsia if >7 */}
                    {data.totalSelected > 12 ? (
                        <span className="flex text-[10px] font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-500/30 items-center gap-1.5 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            &gt;12 Μαθηματα
                        </span>
                    ) : data.totalSelected > 7 && (
                        <span className="flex text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2.5 py-1 rounded-full border border-fuchsia-100 dark:border-fuchsia-500/30 items-center gap-1.5 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            &gt;7 Μαθηματα
                        </span>
                    )}
                    <div className="flex flex-col items-end px-3 py-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Αριθμος Μαθηματων</span>
                        <span className={`text-lg font-black leading-none ${data.totalSelected > 12 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-800 dark:text-gray-100'}`}>
                           {data.totalSelected}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-1 space-y-1 bg-gray-50/50 dark:bg-gray-800/20">
                {/* Rule Banners */}
                {!hideWarnings && semRules.filter(r => r.type !== 'compulsory').length > 0 && (
                    <div className="p-3 space-y-2">
                         {semRules.filter(r => r.type !== 'compulsory').map(rule => {
                            const flowCode = rule.flowCode;
                            const greekFlow = flowCode ? (FLOW_NAMES[flowCode]?.replace(/Flow |Ροή /g, '') || flowCode) : '';
                            const flowLabel = flowCode ? (greekFlow === 'Κορμός' ? 'Κορμός' : `Ροή ${greekFlow}`) : '';
                            
                            const rColorClass = ruleColors[rule.ruleId] || 'border-amber-400 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300';
                            const allClasses = rColorClass.split(' ');
                            const rBorderClasses = allClasses.filter(cls => cls === 'border' || cls.includes('border-') && !cls.includes('border-l') && !cls.includes('border-y') && !cls.includes('border-r')).join(' ') || 'border-amber-400 dark:border-amber-500/40';
                            const rBgClasses = allClasses.filter(cls => cls.startsWith('bg-') || cls.startsWith('dark:bg-')).join(' ') || 'bg-amber-50 dark:bg-amber-500/10';
                            const rTextClasses = allClasses.filter(cls => cls.startsWith('text-') || cls.startsWith('dark:text-')).join(' ') || 'text-amber-900 dark:text-amber-300';

                            const isMetClass = rule.isMet 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-300' 
                                : `${rBgClasses} ${rBorderClasses} ${rTextClasses}`;

                            return (
                                <div key={rule.ruleId} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 shadow-sm transition-all duration-300 ${isMetClass}`}>
                                    <div className="flex flex-col gap-1 w-full">
                                        {flowCode && (
                                            <div className="flex items-center gap-1.5 pb-0.5 border-b border-black/5 dark:border-white/10 w-fit">
                                                <span className={`font-black tracking-wider uppercase flex items-center gap-1 opacity-90 text-[10px]`}>
                                                    {flowLabel.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
                                                    {rule.isMet && <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </span>
                                            </div>
                                        )}
                                        {renderRuleDescription(rule)}
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mt-1 sm:mt-0">
                                        {rule.isMet ? (
                                            <span className="text-[9px] font-bold bg-emerald-100/50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shadow-sm whitespace-nowrap uppercase tracking-wide border border-emerald-200 dark:border-emerald-800">
                                                ΟΛΟΚΛΗΡΩΘΗΚΕ
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black bg-white/50 dark:bg-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm whitespace-nowrap border border-black/5 dark:border-gray-700 opacity-90">
                                                {rule.currentCount} / {rule.targetCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Dropdowns */}
                {data.compulsory.length > 0 && (
                    <div className="border-t border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <button onClick={() => toggleSection(semester, 'comp')} className="w-full px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen('comp') ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
                                   <span className="font-black text-[10px]">Υ</span>
                                </div>
                                <span className={`font-bold text-xs uppercase tracking-wide transition-colors ${isOpen('comp') ? 'text-blue-900 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-800 dark:group-hover:text-blue-400'}`}>ΥΠΟΧΡΕΩΤΙΚΑ</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{data.compulsory.length}</span>
                                <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${isOpen('comp') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('comp') && renderCourseGrid(data.compulsory)}
                    </div>
                )}

                {data.flow_elective.length > 0 && (
                    <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <button onClick={() => toggleSection(semester, 'flow')} className="w-full px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                             <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen('flow') ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/40 group-hover:text-purple-500 dark:group-hover:text-purple-400'}`}>
                                   <span className="font-black text-[10px]">Ρ</span>
                                </div>
                                <div className="text-left">
                                    <span className={`block font-bold text-xs uppercase tracking-wide transition-colors ${isOpen('flow') ? 'text-purple-900 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 group-hover:text-purple-800 dark:group-hover:text-purple-400'}`}>ΚΑΤ' ΕΠΙΛΟΓΗΝ</span>
                                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium hidden sm:inline-block leading-none">Υποχρεωτικά Ροών</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{data.flow_elective.length}</span>
                                <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${isOpen('flow') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('flow') && renderCourseGrid(data.flow_elective, true)}
                    </div>
                )}

                {data.free.length > 0 && (
                    <div className="bg-white dark:bg-gray-900">
                         <button onClick={() => toggleSection(semester, 'free')} className="w-full px-4 py-2.5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen('free') ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'}`}>
                                   <span className="font-black text-[10px]">Ε</span>
                                </div>
                                <span className={`font-bold text-xs uppercase tracking-wide transition-colors ${isOpen('free') ? 'text-emerald-900 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-400'}`}>ΕΛΕΥΘΕΡΑ / ΑΛΛΑ</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{data.free.length}</span>
                                <svg className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ${isOpen('free') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('free') && renderCourseGrid(data.free)}
                    </div>
                )}
            </div>

            {/* Footer Stats - Updated Layout */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 rounded-b-2xl">
                {/* Left: Total Courses */}
                <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold text-gray-400 dark:text-gray-500">Συνολο Μαθηματων</span>
                    <span className="bg-gray-800 dark:bg-gray-700 text-white px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm">{data.totalSelected}</span>
                </div>

                {/* Right: Hours (Theory, Lab) */}
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2" title="Ωρες Θεωρίας">
                        <span className="p-1.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm text-blue-600 dark:text-blue-400">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </span>
                        <span>Θεωρία: <strong className="text-gray-800 dark:text-gray-100 text-sm ml-1">{data.totalLectureHours}</strong> ω</span>
                    </div>
                    <div className="flex items-center gap-2" title="Ωρες Εργαστηρίου">
                        <span className="p-1.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm text-purple-600 dark:text-purple-400">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </span>
                        <span>Εργαστήριο: <strong className="text-gray-800 dark:text-gray-100 text-sm ml-1">{data.totalLabHours}</strong> ω</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SemesterSection;
