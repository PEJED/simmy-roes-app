import type { Course } from '../types/Course';

interface CourseCardProps {
    course: Course;
    onClick: (course: Course) => void;
    isSelected: boolean;
}

const CourseCard = ({ course, onClick, isSelected }: CourseCardProps) => {
    return (
        <div
            onClick={() => onClick(course)}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all border-2
                ${isSelected ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-200'}
            `}
        >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
                    Εξάμηνο: {course.semester}
                </span>
                <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full">
                    {course.flow}
                </span>
            </div>
            {isSelected && (
                <div className="mt-2 text-green-600 font-medium text-sm flex items-center">
                    ✓ Επιλεγμένο
                </div>
            )}
        </div>
    );
};

export default CourseCard;
