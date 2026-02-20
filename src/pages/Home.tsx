import React from 'react';
import { WizardProvider, useWizard } from '../context/WizardContext';
import Step1Strategy from '../components/Wizard/Step1Strategy';
import Step2Courses from '../components/Wizard/Step2Courses';
// We might want to keep the Sidebar but it needs adapting to the Wizard context
// For now, let's just focus on the wizard steps. The Sidebar was relying on the old hook.
// I'll disable the sidebar for this iteration unless requested, or adapt it.
// The user said "Delete the previous UI with Modal". Sidebar wasn't explicitly mentioned but "Wizard Flow" usually implies a linear process.
// Step 2 has a summary count.

const WizardOrchestrator: React.FC = () => {
  const { step } = useWizard();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">
            Επιλογή Ροών ΣΗΜΜΥ - Οδηγός
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-100 text-blue-800' : ''}`}>1. Ροές</span>
             <span>&rsaquo;</span>
             <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-100 text-blue-800' : ''}`}>2. Μαθήματα</span>
          </div>
        </div>
      </header>

      {/* Steps */}
      <main className="w-full">
        {step === 1 && <Step1Strategy />}
        {step === 2 && <Step2Courses />}
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
