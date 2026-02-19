import { useState } from 'react';
import CourseList from '../components/CourseList';
import CourseDetailsModal from '../components/CourseDetailsModal';
import { courses } from '../data/courses';
import type { Course } from '../types/Course';

const Home = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <header className="mb-12 mt-8">
        <h1 className="text-4xl font-bold text-blue-900 text-center">
          Επιλογή Ροών ΣΗΜΜΥ
        </h1>
        <p className="text-gray-600 mt-2 text-center">
            Εξερευνήστε τα μαθήματα και επιλέξτε την κατεύθυνσή σας.
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto">
          <CourseList courses={courses} onCourseClick={handleCourseClick} />
      </main>

      {selectedCourse && (
        <CourseDetailsModal
            course={selectedCourse}
            onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Home;
