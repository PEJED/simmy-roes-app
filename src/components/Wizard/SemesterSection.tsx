import React, { useState } from 'react';
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
}

const SemesterSection: React.FC<SemesterSectionProps> = ({
    semester,
    data,
    semRules,
    selectedCourseIds,
    lockedCourseIds,
    toggleCourse,
    ruleColors
}) => {
    // State must be here to persist across parent re-renders (if component instance is stable)
    const [openSections, setOpenSections] = useState({ comp: true, flow: true, free: false });

    const isOverLimit = data.totalSelected > 7;
    const isHardLimit = data.totalSelected >= 12;

    const toggle = (key: keyof typeof openSections) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

    const renderCourseGrid = (courses: Course[], sectionBlocked: boolean) => (
        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => {
                const id = String(c.id);
                const isSelected = selectedCourseIds.includes(id);

                const blockingRule = semRules.find(r => r.isStrict && r.isMet && r.involvedCourseIds.includes(id));

                let disabled = false;
                let tooltip = "";
                let extraClass = "";

                // Highlight Active Rules
                const activeRule = semRules.find(r => !r.isMet && r.involvedCourseIds.includes(id));
                if (activeRule) {
                    const color = ruleColors[activeRule.ruleId] || 'ring-yellow-400';
                    extraClass = `ring-2 ${color} ring-offset-2`;
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
                    } else if (sectionBlocked) { // Explicit semester blocking
                         disabled = true;
                         tooltip = "Υπέρβαση ορίου μαθημάτων (>7)";
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
        <div className="mb-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
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
                {/* Rule Banners */}
                {semRules.map(rule => {
                    // Greek Flow Name
                    const greekFlow = FLOW_NAMES[rule.flowCode]?.replace(/Flow |Ροή /g, '') || rule.flowCode;
                    const colorClass = rule.isMet ? 'bg-green-50 border-green-500 text-green-800' : 'bg-yellow-50 border-yellow-400 text-yellow-800';
                    const ruleColor = ruleColors[rule.ruleId] ? ruleColors[rule.ruleId].replace('ring-', 'border-') : 'border-l-4';

                    return (
                        <div key={rule.ruleId} className={`p-3 rounded-lg border-l-4 text-sm flex justify-between items-center ${colorClass} ${rule.isMet ? 'border-green-500' : ruleColor.replace('ring-', 'border-')}`}>
                            <span><strong>Ροή {greekFlow}</strong>: {rule.description}</span>
                            {rule.isMet ? (
                                <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-green-700 whitespace-nowrap ml-2">Ολοκληρώθηκε</span>
                            ) : (
                                <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-yellow-700 whitespace-nowrap ml-2">{rule.currentCount}/{rule.targetCount}</span>
                            )}
                        </div>
                    );
                })}

                {/* Dropdowns */}
                {data.compulsory.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('comp')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Υποχρεωτικα</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.compulsory.length}</span>
                                <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.comp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {openSections.comp && renderCourseGrid(data.compulsory, isOverLimit)}
                    </div>
                )}

                {data.flow_elective.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('flow')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Κατ' επιλογην Υποχρεωτικα / Ροης</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.flow_elective.length}</span>
                                <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.flow ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {openSections.flow && renderCourseGrid(data.flow_elective, isOverLimit)}
                    </div>
                )}

                {data.free.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggle('free')} className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors">
                            <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Ελευθερα / Αλλα</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.free.length}</span>
                                <svg className={`w-4 h-4 text-gray-500 transform transition-transform ${openSections.free ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>
                        {openSections.free && renderCourseGrid(data.free, isOverLimit)}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-600 flex justify-between font-medium">
                <div className="flex gap-4">
                    <span>Ώρες Διδασκαλίας: <strong>{data.totalLectureHours}</strong></span>
                    <span>Ώρες Εργαστηρίου: <strong>{data.totalLabHours}</strong></span>
                </div>
                <span>ECTS: <strong>{data.totalECTS}</strong></span>
            </div>
        </div>
    );
};

export default SemesterSection;
