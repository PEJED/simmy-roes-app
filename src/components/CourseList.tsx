import type { Course } from '../types/Course';
import CourseCard from './CourseCard';

interface CourseListProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
    selectedIds: number[];
}

const CourseList = ({ courses, onCourseClick, selectedIds }: CourseListProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {courses.map(course => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onClick={onCourseClick}
                    isSelected={selectedIds.includes(course.id)}
                />
            ))}
        </div>
    );
};

export default CourseList;
