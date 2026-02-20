import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { courses } from '../../data/courses';
import CourseCard from '../CourseCard';
import { Course } from '../../types/Course';

const Step2Courses: React.FC = () => {
  const { flowSelections, selectedCourseIds, toggleCourse, setStep } = useWizard();

  // Filter courses based on flow selections
  const availableCourses = useMemo(() => {
    // We assume courses from mock data have 'flow_code' or we derive it from 'flow' string
    // The previous implementation added flow_code to the Course type.

    return courses.filter((course) => {
      // Logic:
      // - Include Core courses? Usually yes.
      // - Include Free courses? Yes.
      // - Include Humanities? Yes.
      // - If course has a flow_code, check if that flow is selected as 'half' or 'full'.

      if (course.type === 'compulsory' || course.type === 'humanities' || course.type === 'free') {
        return true;
      }

      // If it's a flow course (elective/compulsory within flow)
      if (course.flow_code) {
        const selection = flowSelections[course.flow_code];
        return selection === 'half' || selection === 'full';
      }

      return false;
    });
  }, [flowSelections]);

  const handleToggle = (course: Course) => {
    toggleCourse(course.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-4">
        <div>
           <button
             onClick={() => setStep(1)}
             className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium mb-1 transition-colors group"
           >
             <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span> Πίσω στην Επιλογή Ροών
           </button>
           <h2 className="text-3xl font-bold text-gray-900">2. Επιλογή Μαθημάτων</h2>
           <p className="text-gray-500 mt-1">Επιλέξτε τα μαθήματα που θέλετε να παρακολουθήσετε από τις ροές που διαλέξατε.</p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-medium shadow-sm">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           <span>{selectedCourseIds.length} Μαθήματα</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availableCourses.length > 0 ? (
          availableCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={selectedCourseIds.includes(course.id)}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
             <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p className="text-lg font-medium">Δεν βρέθηκαν διαθέσιμα μαθήματα.</p>
             <p className="text-sm">Δοκιμάστε να αλλάξετε τις επιλογές ροών στο προηγούμενο βήμα.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2Courses;
