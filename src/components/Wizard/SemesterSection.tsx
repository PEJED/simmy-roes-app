import React, { memo } from 'react';
import type { Course } from '../../types/Course';
import type { RuleStatus } from '../../utils/ruleEvaluator';
import { FLOW_NAMES } from '../../utils/flowValidation';
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
    satisfiedFlows?: Set<string>; // New Prop
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
    satisfiedFlows = new Set() // Default empty set
}) => {

    // Updated Logic: >12 is the only strict warning for badge
    const isHardLimit = data.totalSelected >= 12;

    const isOpen = (sec: string) => !!expandedSections[`${semester}-${sec}`];

    const renderCourseGrid = (courses: Course[]) => (
        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
            {courses.map(c => {
                const id = String(c.id);
                const isSelected = selectedCourseIds.includes(id);

                const blockingRule = semRules.find(r => r.isStrict && r.isMet && r.involvedCourseIds.includes(id));

                let disabled = false;
                let tooltip = "";
                let extraClass = "";

                // Highlight Active Rules (Colored Border/Ring Logic)
                const activeRule = semRules.find(r => !r.isMet && r.involvedCourseIds.includes(id));

                if (activeRule) {
                    // Priority 1: Active Warning (Red/Orange/etc)
                    const colorClass = ruleColors[activeRule.ruleId] || 'border-yellow-400';
                    const ringColor = colorClass.split(' ').find(cls => cls.startsWith('border-'))?.replace('border-', 'ring-') || 'ring-yellow-400';
                    // Pass ring and border color.
                    extraClass = `ring-2 ring-offset-2 ${ringColor}`;
                } else if (isSelected && c.flow_code && satisfiedFlows.has(c.flow_code)) {
                    // Priority 2: Satisfied Flow (Green)
                    // Only apply if selected and flow is satisfied
                    extraClass = `ring-2 ring-offset-2 ring-green-500 border-green-500`;
                }

                if (lockedCourseIds.includes(id)) {
                    disabled = true;
                    tooltip = "Κλειδωμένο από επιλογή ροής (υποχρεωτικό άλλης κατεύθυνσης/ροής)";
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
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-white/90">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 blur-sm rounded-full opacity-20"></div>
                        <span className="relative bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shadow-lg shadow-blue-200 z-10">{semester}ο</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">Εξάμηνο</h3>
                </div>
                <div className="flex items-center gap-3">
                    {/* Show Red Warning if >12, Orange if >7 */}
                    {data.totalSelected > 12 ? (
                        <span className="flex text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 items-center gap-1.5 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            &gt;12 Μαθηματα
                        </span>
                    ) : data.totalSelected > 7 && (
                        <span className="flex text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 items-center gap-1.5 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            &gt;7 Μαθηματα
                        </span>
                    )}
                    <div className="flex flex-col items-end px-3 py-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Αριθμος Μαθηματων</span>
                        <span className={`text-lg font-black leading-none ${data.totalSelected > 12 ? 'text-red-600' : 'text-gray-800'}`}>
                           {data.totalSelected}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-1 space-y-1 bg-gray-50/50">
                {/* Rule Banners */}
                {semRules.length > 0 && (
                    <div className="p-4 space-y-3">
                         {semRules.map(rule => {
                            const greekFlow = FLOW_NAMES[rule.flowCode]?.replace(/Flow |Ροή /g, '') || rule.flowCode;
                            const colorClasses = ruleColors[rule.ruleId] || 'border-yellow-500 bg-yellow-50 text-yellow-900';

                            const finalClass = rule.isMet
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                : colorClasses;

                            return (
                                <div key={rule.ruleId} className={`p-3.5 rounded-xl border-l-4 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-sm ${finalClass}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="font-black whitespace-nowrap px-1.5 py-0.5 bg-white/40 rounded text-[10px] uppercase tracking-wider self-start mt-0.5">
                                            Ροή {greekFlow}
                                        </span>
                                        <span className="font-medium leading-snug">{rule.description}</span>
                                    </div>

                                    {rule.isMet ? (
                                        <span className="text-[10px] font-bold bg-white/60 px-2 py-1 rounded-lg text-emerald-700 flex items-center gap-1 shadow-sm whitespace-nowrap self-start sm:self-auto">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Ολοκληρώθηκε
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold bg-white/40 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm whitespace-nowrap self-start sm:self-auto border border-current opacity-80">
                                            {rule.currentCount} / {rule.targetCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Dropdowns */}
                {data.compulsory.length > 0 && (
                    <div className="border-t border-b border-gray-100 bg-white">
                        <button onClick={() => toggleSection(semester, 'comp')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen('comp') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                   <span className="font-black text-xs">Υ</span>
                                </div>
                                <span className={`font-bold text-sm uppercase tracking-wide transition-colors ${isOpen('comp') ? 'text-blue-900' : 'text-gray-600 group-hover:text-blue-800'}`}>Υποχρεωτικα</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{data.compulsory.length}</span>
                                <svg className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${isOpen('comp') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('comp') && renderCourseGrid(data.compulsory)}
                    </div>
                )}

                {data.flow_elective.length > 0 && (
                    <div className="border-b border-gray-100 bg-white">
                        <button onClick={() => toggleSection(semester, 'flow')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen('flow') ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500'}`}>
                                   <span className="font-black text-xs">Ρ</span>
                                </div>
                                <div className="text-left">
                                    <span className={`block font-bold text-sm uppercase tracking-wide transition-colors ${isOpen('flow') ? 'text-purple-900' : 'text-gray-600 group-hover:text-purple-800'}`}>Κατ' επιλογην</span>
                                    <span className="text-[10px] text-gray-400 font-medium hidden sm:inline-block">Υποχρεωτικά Ροών</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{data.flow_elective.length}</span>
                                <svg className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${isOpen('flow') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('flow') && renderCourseGrid(data.flow_elective)}
                    </div>
                )}

                {data.free.length > 0 && (
                    <div className="bg-white">
                         <button onClick={() => toggleSection(semester, 'free')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen('free') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                                   <span className="font-black text-xs">Ε</span>
                                </div>
                                <span className={`font-bold text-sm uppercase tracking-wide transition-colors ${isOpen('free') ? 'text-emerald-900' : 'text-gray-600 group-hover:text-emerald-800'}`}>Ελευθερα / Αλλα</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{data.free.length}</span>
                                <svg className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${isOpen('free') ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {isOpen('free') && renderCourseGrid(data.free)}
                    </div>
                )}
            </div>

            {/* Footer Stats - Updated Layout */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between text-xs font-medium text-gray-500 rounded-b-2xl">
                {/* Left: Total Courses */}
                <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest text-[10px] font-bold text-gray-400">Συνολο Μαθηματων</span>
                    <span className="bg-gray-800 text-white px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm">{data.totalSelected}</span>
                </div>

                {/* Right: Hours (Theory, Lab) */}
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2" title="Ώρες Θεωρίας">
                        <span className="p-1.5 bg-white rounded-md border border-gray-200 shadow-sm text-blue-600">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </span>
                        <span>Θεωρία: <strong className="text-gray-800 text-sm ml-1">{data.totalLectureHours}</strong> ω</span>
                    </div>
                    <div className="flex items-center gap-2" title="Ώρες Εργαστηρίου">
                        <span className="p-1.5 bg-white rounded-md border border-gray-200 shadow-sm text-purple-600">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </span>
                        <span>Εργαστήριο: <strong className="text-gray-800 text-sm ml-1">{data.totalLabHours}</strong> ω</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SemesterSection;
