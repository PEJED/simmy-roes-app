import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { DIRECTION_INFO, type Direction } from '../../utils/flowValidation';

// Simple SVG Icons - Larger
const Icons: Record<Direction, React.ReactNode> = {
  Electronics: (
    <svg className="w-12 h-12 text-blue-600 mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Informatics: (
    <svg className="w-12 h-12 text-indigo-600 mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Communications: (
    <svg className="w-12 h-12 text-purple-600 mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Energy: (
    <svg className="w-12 h-12 text-yellow-500 mb-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Επιλογή Κατεύθυνσης</h2>
        <p className="text-gray-600 text-lg">
          Επιλέξτε την κατεύθυνση που σας ενδιαφέρει.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {Object.entries(DIRECTION_INFO).map(([key, info]) => {
          const isSelected = direction === key;

          return (
            <button
              key={key}
              onClick={() => handleSelect(key as Direction)}
              className={`group relative p-8 min-h-48 rounded-3xl text-left transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col justify-between overflow-hidden
                ${isSelected
                  ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-500 shadow-lg ring-4 ring-blue-500/10'
                  : 'bg-white border-2 border-gray-100 shadow-sm hover:border-blue-300'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full shadow-md animate-in zoom-in duration-200">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start gap-6 h-full relative z-10">
                 <div className={`transition-transform duration-300 group-hover:scale-110 flex-shrink-0 mt-1 bg-gray-50 p-4 rounded-2xl group-hover:bg-blue-50`}>
                   {Icons[key as Direction]}
                 </div>

                 <div className="flex-1 flex flex-col h-full">
                    <h3 className={`text-2xl font-black tracking-tight mb-3 ${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700 transition-colors'}`}>
                      {info.name}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed font-medium">
                      {info.description}
                    </p>
                 </div>
              </div>

              {/* Optional background decoration */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 ${isSelected ? 'bg-blue-400/20 opacity-100' : 'bg-gray-200/50 opacity-0 group-hover:opacity-100 group-hover:bg-blue-200/30'}`}></div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center mt-12">
        <button
          disabled={!direction}
          onClick={() => setStep(2)}
          className={`px-12 py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all flex items-center gap-3 transform active:scale-95 ${
            direction
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 shadow-blue-200/50 ring-4 ring-blue-500/20'
              : 'bg-gray-300 cursor-not-allowed shadow-none opacity-80'
          }`}
        >
          Συνέχεια
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step1Direction;
