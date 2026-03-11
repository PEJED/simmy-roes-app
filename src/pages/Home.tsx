import React, { useState } from 'react';
import { WizardProvider, useWizard } from '../context/WizardContext';
import Step1Direction from '../components/Wizard/Step1_Direction';
import Step2Flows from '../components/Wizard/Step2_Flows';
import Step3Courses from '../components/Wizard/Step3_Courses';
import ThemeToggle from '../components/ThemeToggle';
import SavedProfilesSidebar from '../components/SavedProfilesSidebar';
import SaveProfileModal from '../components/SaveProfileModal';

const WizardOrchestrator: React.FC = () => {
  const { step, setStep, direction, selectedCombinationId, savedProfiles, saveProfile, activeProfileId, updateProfile } = useWizard();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2 && direction) {
      setStep(2);
    } else if (targetStep === 3 && selectedCombinationId) {
      setStep(3);
    }
  };

  // Default name for a new profile, e.g. "Αρχείο 3"
  const defaultProfileName = `Αρχείο ${savedProfiles.length + 1}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
      {/* Sidebar + Modal (always mounted) */}
      <SavedProfilesSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSaveRequest={() => setSaveModalOpen(true)}
      />
      <SaveProfileModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={saveProfile}
        defaultName={defaultProfileName}
      />

      {/* Header - Sticky with High Z-Index */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">

            {/* Left: Hamburger + Title */}
            <div className="flex items-center gap-3">
              {/* Hamburger button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                title="Αποθηκευμένα Αρχεία"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {savedProfiles.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {savedProfiles.length > 9 ? '9+' : savedProfiles.length}
                  </span>
                )}
              </button>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-md">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </span>
                ΣΗΜΜΥ Οδηγός 2024-25
              </h1>
            </div>

            {/* Right: Stepper + Save + Theme */}
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto md:overflow-visible custom-scrollbar pb-2 md:pb-0 justify-between md:justify-end">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 md:flex-none justify-center min-w-max">
                {/* Step 1 */}
                <button
                  onClick={() => handleStepClick(1)}
                  className={`flex flex-col sm:flex-row items-center gap-2 group transition-all duration-300 ${
                    step >= 1 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                    step > 1
                      ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/20 ring-2 ring-green-100 dark:ring-green-900/50'
                      : step === 1
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/50'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                  }`}>
                    {step > 1 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : '1'}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 1 ? 'text-blue-700 dark:text-blue-400' : step > 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    Κατεύθυνση
                  </span>
                </button>

                {/* Connector */}
                <div className={`h-[2px] w-8 sm:w-12 transition-colors duration-500 ${step > 1 ? 'bg-green-400 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                {/* Step 2 */}
                <button
                  onClick={() => handleStepClick(2)}
                  disabled={!direction}
                  className={`flex flex-col sm:flex-row items-center gap-2 group transition-all duration-300 ${
                    (step >= 2 || direction) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                    step > 2
                      ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/20 ring-2 ring-green-100 dark:ring-green-900/50'
                      : step === 2
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/50'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                  }`}>
                    {step > 2 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : '2'}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 2 ? 'text-blue-700 dark:text-blue-400' : step > 2 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    Ροές
                  </span>
                </button>

                {/* Connector */}
                <div className={`h-[2px] w-8 sm:w-12 transition-colors duration-500 ${step > 2 ? 'bg-green-400 dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>

                {/* Step 3 */}
                <button
                  onClick={() => handleStepClick(3)}
                  disabled={!selectedCombinationId}
                  className={`flex flex-col sm:flex-row items-center gap-2 group transition-all duration-300 ${
                    (step >= 3 || selectedCombinationId) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                    step === 3
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/50'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
                  }`}>
                    3
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 3 ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    Μαθήματα
                  </span>
                </button>
              </div>

              {/* Save button (header — always visible) */}
              {activeProfileId ? (
                 <div className="flex items-stretch rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shadow-sm shrink-0">
                    <button
                      onClick={() => {
                        updateProfile();
                        // Provide simple visual feedback to user
                        const btn = document.getElementById('save-header-btn');
                        if (btn) {
                          const oldHtml = btn.innerHTML;
                          btn.innerHTML = '<span class="hidden sm:inline">Αποθηκεύτηκε!</span><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>';
                          btn.classList.add('bg-green-100', 'dark:bg-green-900/50', 'text-green-700', 'dark:text-green-300');
                          setTimeout(() => {
                            btn.innerHTML = oldHtml;
                            btn.classList.remove('bg-green-100', 'dark:bg-green-900/50', 'text-green-700', 'dark:text-green-300');
                          }, 2000);
                        }
                      }}
                      id="save-header-btn"
                      className="flex items-center gap-1.5 px-3 py-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      title="Αποθήκευση αλλαγών στο τρέχον αρχείο"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      <span className="hidden sm:inline">Αποθήκευση</span>
                    </button>
                    <div className="w-[1px] bg-indigo-200 dark:bg-indigo-800/50 my-1"></div>
                    <button
                      onClick={() => setSaveModalOpen(true)}
                      className="flex items-center px-2 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      title="Αποθήκευση ως νέο αρχείο..."
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                 </div>
              ) : (
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shrink-0 shadow-sm"
                  title="Αποθήκευση επιλογών"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span className="hidden sm:inline">Αποθήκευση</span>
                </button>
              )}

              <div className="ml-2 pl-2 md:ml-4 md:pl-4 border-l border-gray-200 dark:border-gray-700 flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 pt-8">
        {step === 1 && <Step1Direction />}
        {step === 2 && <Step2Flows />}
        {step === 3 && <Step3Courses onSaveRequest={() => setSaveModalOpen(true)} />}
      </main>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <WizardProvider>
      <WizardOrchestrator />
    </WizardProvider>
  );
};

export default Home;
