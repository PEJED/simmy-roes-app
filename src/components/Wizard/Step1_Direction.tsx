import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { DIRECTION_INFO, type Direction } from '../../utils/flowValidation';

// Simple SVG Icons
const Icons: Record<Direction, React.ReactNode> = {
  Electronics: (
    <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Informatics: (
    <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Communications: (
    <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Energy: (
    <svg className="w-8 h-8 text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const Step1Direction: React.FC = () => {
  const { setDirection, setStep, direction } = useWizard();

  const handleSelect = (dir: Direction) => {
    setDirection(dir);
    setStep(2);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Επιλογή Κατεύθυνσης</h2>
        <p className="text-gray-500 text-sm">
          Επιλέξτε την κατεύθυνση που σας ενδιαφέρει.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {Object.entries(DIRECTION_INFO).map(([key, info]) => {
          const isSelected = direction === key;

          return (
            <button
              key={key}
              onClick={() => handleSelect(key as Direction)}
              className={`group relative p-5 rounded-xl text-left transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md
                ${isSelected
                  ? 'bg-white border-2 border-blue-600 shadow-md ring-2 ring-blue-50'
                  : 'bg-white border border-gray-200 shadow-sm hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-start gap-4">
                 <div className={`transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                   {Icons[key as Direction]}
                 </div>

                 <div>
                    <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-600'}`}>
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-500 leading-snug group-hover:text-gray-600 line-clamp-3">
                      {info.description}
                    </p>
                 </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1Direction;
