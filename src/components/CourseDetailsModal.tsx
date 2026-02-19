import type { Course } from '../types/Course';

interface CourseDetailsModalProps {
    course: Course | null;
    onClose: () => void;
    onToggleSelect: (course: Course) => void;
    isSelected: boolean;
}

const CourseDetailsModal = ({ course, onClose, onToggleSelect, isSelected }: CourseDetailsModalProps) => {
    if (!course) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Κλείσιμο"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">
                    {course.title}
                </h2>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                         <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                            Εξάμηνο {course.semester}
                        </span>
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                            Ροή: {course.flow}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded">
                            {course.ects} ECTS
                        </span>
                         <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded uppercase">
                            {course.type}
                        </span>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Περιγραφή</h4>
                        <p className="text-gray-600 leading-relaxed">
                            {course.description}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                    <button
                        onClick={() => onToggleSelect(course)}
                        className={`px-6 py-2 rounded font-medium transition-colors ${
                            isSelected
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isSelected ? 'Αφαίρεση' : 'Επιλογή Μαθήματος'}
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Κλείσιμο
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal;
