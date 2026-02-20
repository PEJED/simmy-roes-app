import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { Direction, DIRECTION_RULES, FLOW_NAMES } from '../../utils/flowValidation';

const Step1Strategy: React.FC = () => {
  const { direction, setDirection, flowSelections, setFlowSelection, validation, setStep } = useWizard();

  // Local error state to only show error after they try to proceed or interact
  // But requirement says "If selection doesn't meet rule... button disabled and red message".
  // So we show it always if invalid? Or only when direction is selected.
  // Validation object comes from context and is re-calculated.

  const handleNext = () => {
    if (validation.isValid) {
      setStep(2);
    }
  };

  const directions: Direction[] = ['Electronics', 'Informatics', 'Communications', 'Energy'];
  const flowCodes = Object.keys(FLOW_NAMES);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Βήμα 1: Επιλογή Κατεύθυνσης & Ροών
      </h2>

      {/* Direction Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">1. Επιλέξτε Κατεύθυνση</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {directions.map((dir) => (
            <button
              key={dir}
              onClick={() => setDirection(dir)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2
                ${direction === dir
                  ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md transform scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'}`}
            >
              <span className="font-bold text-lg">{DIRECTION_RULES[dir].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flow Selection - Only show if Direction is selected */}
      {direction && (
        <div className="mb-8 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            2. Διαμόρφωση Ροών για {DIRECTION_RULES[direction].name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
             Απαιτείται: {DIRECTION_RULES[direction].requiredFlows.map(f => FLOW_NAMES[f]).join(' + ')} (Ολόκληρες)
             {' '} και {DIRECTION_RULES[direction].requiredHalfFlows} ακόμα μισή/ολόκληρη ροή.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {flowCodes.map((code) => {
               // Highlight required flows
               const isRequired = DIRECTION_RULES[direction].requiredFlows.includes(code);

               return (
                <div key={code} className={`flex items-center justify-between p-3 rounded-lg border ${isRequired ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                  <span className={`font-medium ${isRequired ? 'text-blue-900' : 'text-gray-700'}`}>
                    {FLOW_NAMES[code]} ({code}) {isRequired && '*'}
                  </span>

                  <div className="flex gap-1 bg-white p-1 rounded border border-gray-200">
                    {(['none', 'half', 'full'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFlowSelection(code, opt)}
                        className={`px-3 py-1 text-xs rounded transition-colors
                          ${(flowSelections[code] || 'none') === opt
                            ? (opt === 'none' ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white font-bold')
                            : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        {opt === 'none' ? 'Καμία' : opt === 'half' ? 'Μισή' : 'Ολόκληρη'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Message & Next Button */}
      <div className="border-t pt-6 mt-6 flex flex-col items-end">
        {!validation.isValid && direction && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded w-full text-sm">
            <strong>Προσοχή:</strong> {validation.error}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!validation.isValid || !direction}
          className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all
            ${!validation.isValid || !direction
              ? 'bg-gray-400 cursor-not-allowed opacity-70'
              : 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
        >
          Επόμενο Βήμα &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step1Strategy;
