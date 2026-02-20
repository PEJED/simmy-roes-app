import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { DIRECTION_INFO, FLOW_NAMES, FLOW_DESCRIPTIONS } from '../../utils/flowValidation';
import type { Direction, FlowSelection } from '../../utils/flowValidation';

const Step1Strategy: React.FC = () => {
  const { direction, setDirection, flowSelections, setFlowSelection, validation, setStep } = useWizard();

  const handleNext = () => {
    if (validation.isValid) {
      setStep(2);
    }
  };

  const cycleFlowSelection = (code: string) => {
    const current = flowSelections[code] || 'none';
    let next: FlowSelection = 'none';

    if (current === 'none') next = 'half';
    else if (current === 'half') next = 'full';
    else if (current === 'full') next = 'none';

    setFlowSelection(code, next);
  };

  const getFlowStyle = (selection: FlowSelection) => {
    switch (selection) {
      case 'full':
        return 'bg-green-100 border-green-500 text-green-900 ring-2 ring-green-500 ring-opacity-50';
      case 'half':
        return 'bg-orange-100 border-orange-500 text-orange-900 ring-2 ring-orange-400 ring-opacity-50';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300';
    }
  };

  const getStatusLabel = (selection: FlowSelection) => {
    switch (selection) {
      case 'full': return 'Ολόκληρη';
      case 'half': return 'Μισή';
      default: return 'Καμία';
    }
  };

  const directions: Direction[] = ['Electronics', 'Informatics', 'Communications', 'Energy'];
  const flowCodes = Object.keys(FLOW_NAMES);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-2xl animate-fade-in">
      <div className="border-b pb-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Βήμα 1: Κατεύθυνση & Ροές</h2>
        <p className="text-gray-500">Επιλέξτε την κατεύθυνσή σας και στη συνέχεια καθορίστε τις ροές μαθημάτων κάνοντας κλικ στα κουτάκια.</p>
      </div>

      {/* Direction Selection */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
          Επιλογή Κατεύθυνσης
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {directions.map((dir) => (
            <button
              key={dir}
              onClick={() => setDirection(dir)}
              className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden group
                ${direction === dir
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50 text-gray-600'}`}
            >
              <span className="font-bold text-lg tracking-tight">{DIRECTION_INFO[dir].name}</span>
              {direction === dir && (
                <div className="absolute top-2 right-2 text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Information Card - Rule Display */}
      {direction && (
        <div className="mb-10 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg shadow-sm animate-fade-in-up">
          <div className="flex items-start gap-4">
             <div className="bg-blue-200 p-2 rounded-full text-blue-700 mt-1">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-blue-900 text-lg mb-2">Κανόνες για {DIRECTION_INFO[direction].name}</h4>
               <p className="text-blue-800 font-medium leading-relaxed">
                 {DIRECTION_INFO[direction].description}
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Flow Grid */}
      {direction && (
        <div className="mb-12 animate-fade-in">
           <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
            Επιλογή Ροών <span className="text-sm font-normal text-gray-500 ml-2">(Κλικ για αλλαγή κατάστασης)</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {flowCodes.map((code) => {
              const selection = flowSelections[code] || 'none';
              const styleClass = getFlowStyle(selection);

              return (
                <div key={code} className="relative group">
                   <button
                    onClick={() => cycleFlowSelection(code)}
                    className={`w-full aspect-square flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 shadow-sm ${styleClass}`}
                  >
                    <span className="text-3xl font-black mb-2 opacity-20 group-hover:opacity-40 transition-opacity">{code}</span>
                    <span className="font-bold text-lg text-center leading-tight">{FLOW_NAMES[code]}</span>

                    <span className={`mt-3 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white bg-opacity-50`}>
                      {getStatusLabel(selection)}
                    </span>
                  </button>

                  {/* Tooltip on Hover */}
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                    <strong className="block text-sm mb-1">{FLOW_NAMES[code]}</strong>
                    {FLOW_DESCRIPTIONS[code]}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation & Next Button */}
      <div className="border-t pt-8 flex flex-col items-center md:items-end gap-4">
        {direction && !validation.isValid && (
           <div className="text-red-600 font-medium flex items-center gap-2 animate-pulse">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {validation.error || 'Οι επιλογές δεν πληρούν τους κανόνες.'}
           </div>
        )}

        <button
          onClick={handleNext}
          disabled={!validation.isValid || !direction}
          className={`w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3
            ${!validation.isValid || !direction
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
            }`}
        >
          Επόμενο Βήμα
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step1Strategy;
