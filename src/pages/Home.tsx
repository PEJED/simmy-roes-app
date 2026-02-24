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

  const getStepClass = (stepNum: number) => {
    let baseClass = "px-3 py-1 rounded-lg transition-colors text-sm font-medium ";
    if (step === stepNum) {
      return baseClass + "bg-blue-100 text-blue-900 font-bold border border-blue-200";
    }

    const isAccessible =
      stepNum === 1 ||
      (stepNum === 2 && direction) ||
      (stepNum === 3 && selectedCombinationId);

    if (isAccessible) {
      return baseClass + "text-gray-600 hover:text-blue-700 hover:bg-gray-100 cursor-pointer";
    } else {
      return baseClass + "text-gray-300 cursor-not-allowed";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - Sticky with High Z-Index */}
      <div className="sticky top-0 z-50 bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </span>
            Επιλογή Ροών ΣΗΜΜΥ - Οδηγός 2024-25
          </h1>

          <nav className="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
             <button onClick={() => handleStepClick(1)} className={getStepClass(1)}>
               1. Κατεύθυνση
             </button>
             <span className="text-gray-300 font-light text-xl">›</span>
             <button onClick={() => handleStepClick(2)} disabled={!direction} className={getStepClass(2)}>
               2. Ροές
             </button>
             <span className="text-gray-300 font-light text-xl">›</span>
             <button onClick={() => handleStepClick(3)} disabled={!selectedCombinationId} className={getStepClass(3)}>
               3. Μαθήματα
             </button>
          </nav>
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
