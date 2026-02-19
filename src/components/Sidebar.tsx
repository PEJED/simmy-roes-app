import type { Course } from '../types/Course';
import { DIRECTIONS, validateSelection } from '../utils/ruleEngine';
import type { Direction } from '../utils/ruleEngine';
import { useMemo } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCourses: Course[];
    selectedDirection: Direction | null;
    onDirectionChange: (direction: Direction) => void;
}

const Sidebar = ({ isOpen, onClose, selectedCourses, selectedDirection, onDirectionChange }: SidebarProps) => {

    // Group courses by semester
    const groupedCourses = useMemo(() => {
        const groups: Record<number, Course[]> = {};
        selectedCourses.forEach(course => {
            if (!groups[course.semester]) {
                groups[course.semester] = [];
            }
            groups[course.semester].push(course);
        });
        return groups;
    }, [selectedCourses]);

    // Calculate totals
    const totalECTS = selectedCourses.reduce((sum, c) => sum + c.ects, 0);
    const validationWarnings = useMemo(() => validateSelection(selectedCourses, selectedDirection), [selectedCourses, selectedDirection]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-800">Το Πρόγραμμά μου</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Direction Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Επιλογή Κατεύθυνσης
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDirection || ''}
                            onChange={(e) => onDirectionChange(e.target.value as Direction)}
                        >
                            <option value="">-- Επιλέξτε --</option>
                            {Object.entries(DIRECTIONS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Validation Warnings */}
                    {validationWarnings.length > 0 && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Προειδοποιήσεις Κανόνων
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <ul className="list-disc pl-5 space-y-1">
                                            {validationWarnings.map((warning, index) => (
                                                <li key={index}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Courses List */}
                    <div className="space-y-6">
                        {Object.keys(groupedCourses).sort((a,b) => Number(a)-Number(b)).map(semester => (
                            <div key={Number(semester)}>
                                <h3 className="font-semibold text-gray-700 border-b border-gray-100 pb-1 mb-2">
                                    {semester}ο Εξάμηνο
                                </h3>
                                <ul className="space-y-2">
                                    {groupedCourses[Number(semester)].map(course => (
                                        <li key={course.id} className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between items-start">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{course.title}</div>
                                                <div className="text-gray-500 text-xs mt-1">
                                                    {course.flow} • {course.ects} ECTS
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {selectedCourses.length === 0 && (
                            <div className="text-center text-gray-500 py-8 italic">
                                Δεν έχουν επιλεγεί μαθήματα ακόμα.
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {selectedCourses.length > 0 && (
                        <div className="mt-8 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center font-bold text-gray-900">
                                <span>Σύνολο Μαθημάτων:</span>
                                <span>{selectedCourses.length}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-gray-900 mt-2">
                                <span>Σύνολο ECTS:</span>
                                <span>{totalECTS}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
