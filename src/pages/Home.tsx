import { useState, useMemo } from 'react';
import CourseList from '../components/CourseList';
import CourseDetailsModal from '../components/CourseDetailsModal';
import Sidebar from '../components/Sidebar';
import { courses } from '../data/courses';
import { useCourseSelection } from '../hooks/useCourseSelection';
import type { Course } from '../types/Course';

const Home = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    selectedCourseIds,
    toggleCourse: toggleCourseId,
    selectedDirection,
    setDirection
  } = useCourseSelection();

  // Derive the list of selected course objects
  const selectedCourses = useMemo(() => {
    return courses.filter(course => selectedCourseIds.includes(course.id));
  }, [selectedCourseIds]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const handleToggleSelect = (course: Course) => {
    toggleCourseId(course.id);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 relative">
      {/* Header Container */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 relative px-4">

         {/* Left Spacer (hidden on mobile) */}
         <div className="hidden md:flex flex-1"></div>

         {/* Title Section */}
         <div className="text-center mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            Επιλογή Ροών ΣΗΜΜΥ
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
                Εξερευνήστε τα μαθήματα και επιλέξτε την κατεύθυνσή σας.
            </p>
         </div>

         {/* Right Action Button */}
         <div className="flex flex-1 justify-end w-full md:w-auto">
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-blue-700 font-medium transition-colors"
            >
                <span className="text-xl">📋</span>
                <span className="hidden sm:inline">Το Πρόγραμμά μου</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                    {selectedCourseIds.length}
                </span>
            </button>
         </div>
      </header>

      <main className="w-full max-w-7xl mx-auto">
          <CourseList
            courses={courses}
            onCourseClick={handleCourseClick}
            selectedIds={selectedCourseIds}
          />
      </main>

      {selectedCourse && (
        <CourseDetailsModal
            course={selectedCourse}
            onClose={handleCloseModal}
            onToggleSelect={handleToggleSelect}
            isSelected={selectedCourseIds.includes(selectedCourse.id)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedCourses={selectedCourses}
        selectedDirection={selectedDirection}
        onDirectionChange={setDirection}
      />
    </div>
  );
};

export default Home;
