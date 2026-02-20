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
    let baseClass = "px-3 py-1 rounded transition-colors text-sm font-medium ";
    if (step === stepNum) {
      return baseClass + "bg-blue-100 text-blue-800 font-bold";
    }

    // Check if step is accessible/active
    const isAccessible =
      stepNum === 1 ||
      (stepNum === 2 && direction) ||
      (stepNum === 3 && selectedCombinationId);

    if (isAccessible) {
      return baseClass + "text-gray-600 hover:text-blue-600 hover:bg-gray-100 cursor-pointer";
    } else {
      return baseClass + "text-gray-300 cursor-not-allowed";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
            Επιλογή Ροών ΣΗΜΜΥ - Οδηγός 2024-25
          </h1>
          <nav className="flex items-center gap-2">
             <button
               onClick={() => handleStepClick(1)}
               className={getStepClass(1)}
             >
               1. Κατεύθυνση
             </button>
             <span className="text-gray-300">&rsaquo;</span>
             <button
               onClick={() => handleStepClick(2)}
               disabled={!direction}
               className={getStepClass(2)}
             >
               2. Ροές
             </button>
             <span className="text-gray-300">&rsaquo;</span>
             <button
               onClick={() => handleStepClick(3)}
               disabled={!selectedCombinationId}
               className={getStepClass(3)}
             >
               3. Μαθήματα
             </button>
          </nav>
        </div>
      </header>

      {/* Steps */}
      <main className="w-full max-w-7xl mx-auto px-4">
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
