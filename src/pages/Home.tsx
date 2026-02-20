import React from 'react';
import { WizardProvider, useWizard } from '../context/WizardContext';
import Step1Direction from '../components/Wizard/Step1_Direction';
import Step2Flows from '../components/Wizard/Step2_Flows';
import Step3Courses from '../components/Wizard/Step3_Courses';

const WizardOrchestrator: React.FC = () => {
  const { step } = useWizard();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
            Επιλογή Ροών ΣΗΜΜΥ - Οδηγός 2024-25
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <span className={`px-3 py-1 rounded transition-colors ${step === 1 ? 'bg-blue-100 text-blue-800 font-bold' : ''}`}>1. Κατεύθυνση</span>
             <span className="text-gray-300">&rsaquo;</span>
             <span className={`px-3 py-1 rounded transition-colors ${step === 2 ? 'bg-blue-100 text-blue-800 font-bold' : ''}`}>2. Ροές</span>
             <span className="text-gray-300">&rsaquo;</span>
             <span className={`px-3 py-1 rounded transition-colors ${step === 3 ? 'bg-blue-100 text-blue-800 font-bold' : ''}`}>3. Μαθήματα</span>
          </div>
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
