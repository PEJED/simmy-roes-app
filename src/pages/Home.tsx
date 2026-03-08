import React from 'react';
import { WizardProvider, useWizard } from '../context/WizardContext';
import Step1Direction from '../components/Wizard/Step1_Direction';
import Step2Flows from '../components/Wizard/Step2_Flows';
import Step3Courses from '../components/Wizard/Step3_Courses';

const WizardOrchestrator: React.FC = () => {
  const { step, setStep, direction, selectedCombinationId } = useWizard();

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2 && direction) {
      setStep(2);
    } else if (targetStep === 3 && selectedCombinationId) {
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Sticky with High Z-Index */}
      <div className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-md">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </span>
              ΣΗΜΜΥ Οδηγός 2024-25
            </h1>

            {/* Visual Multi-Step Stepper */}
            <div className="flex items-center w-full md:w-auto max-w-lg overflow-x-auto custom-scrollbar pb-2 md:pb-0">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center md:justify-end min-w-max">
                {/* Step 1 */}
                <button
                  onClick={() => handleStepClick(1)}
                  className={`flex flex-col sm:flex-row items-center gap-2 group transition-all duration-300 ${
                    step >= 1 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                    step > 1
                      ? 'bg-green-500 text-white shadow-md shadow-green-200 ring-2 ring-green-100'
                      : step === 1
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step > 1 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : '1'}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 1 ? 'text-blue-700' : step > 1 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Κατεύθυνση
                  </span>
                </button>

                {/* Connector */}
                <div className={`h-[2px] w-8 sm:w-12 transition-colors duration-500 ${
                  step > 1 ? 'bg-green-400' : 'bg-gray-200'
                }`}></div>

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
                      ? 'bg-green-500 text-white shadow-md shadow-green-200 ring-2 ring-green-100'
                      : step === 2
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step > 2 ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : '2'}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 2 ? 'text-blue-700' : step > 2 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Ροές
                  </span>
                </button>

                {/* Connector */}
                <div className={`h-[2px] w-8 sm:w-12 transition-colors duration-500 ${
                  step > 2 ? 'bg-green-400' : 'bg-gray-200'
                }`}></div>

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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    3
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors duration-300 hidden sm:block ${
                    step === 3 ? 'text-blue-700' : 'text-gray-400'
                  }`}>
                    Μαθήματα
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 pt-8">
        {step === 1 && <Step1Direction />}
        {step === 2 && <Step2Flows />}
        {step === 3 && <Step3Courses />}
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
