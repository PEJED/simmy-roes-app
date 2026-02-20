import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { DIRECTION_INFO, FLOW_NAMES, FLOW_DESCRIPTIONS } from '../../utils/flowValidation';
import type { FlowSelection } from '../../utils/flowValidation';
import { FLOW_GREEK_LETTERS, VISUAL_RULES } from '../../utils/visualRules';
import type { RuleOption } from '../../utils/visualRules';

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
        return 'bg-orange-100 border-orange-500 text-orange-900 ring-2 ring-orange-500 ring-opacity-50';
      default:
        return 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:shadow-md';
    }
  };

  const getStatusLabel = (selection: FlowSelection) => {
    switch (selection) {
      case 'full': return 'Ολόκληρη';
      case 'half': return 'Μισή';
      default: return 'Καμία';
    }
  };

  const directions = ['Electronics', 'Informatics', 'Communications', 'Energy'] as const;
  const flowCodes = Object.keys(FLOW_NAMES);

  // Helper to check if a specific part of a rule is satisfied
  const isPartSatisfied = (part: RuleOption['parts'][0]) => {
    if (part.code !== 'ANY') {
       return flowSelections[part.code] === part.type;
    }
    // "ANY" logic: Check if we have 'at least half' (or full) of something else?
    // The VISUAL_RULES definition for 'ANY' is usually '+ Half Other' or '+ Full Other'
    // This is purely for visual highlighting, strictly matching the validation logic is complex here.
    // We can approximate: Is there *any* flow not in the rule's explicit parts that matches the type?
    // For now, let's keep it simple: Don't highlight ANY parts dynamically unless we implement full logic.
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Επιλογή Ροών</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Διαμορφώστε το ακαδημαϊκό σας πρόγραμμα επιλέγοντας την κατεύθυνση και τις ροές που σας ενδιαφέρουν.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Controls (Direction & Grid) */}
        <div className="lg:col-span-8 space-y-8">

          {/* 1. Direction Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
              Επιλογή Κατεύθυνσης
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {directions.map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirection(dir)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 font-bold text-sm md:text-base flex flex-col items-center gap-2 text-center h-full justify-center
                    ${direction === dir
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md scale-[1.02]'
                      : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-500'}`}
                >
                  {DIRECTION_INFO[dir].name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Flow Grid */}
          {direction && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                  Επιλογή Ροών
                </h3>
                <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                  Κλικ: Καμία &rarr; <span className="text-orange-600">Μισή</span> &rarr; <span className="text-green-600">Ολόκληρη</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {flowCodes.map((code) => {
                  const selection = flowSelections[code] || 'none';
                  return (
                    <div key={code} className="relative group">
                      <button
                        onClick={() => cycleFlowSelection(code)}
                        className={`w-full aspect-square flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-300 shadow-sm transform hover:-translate-y-1 ${getFlowStyle(selection)}`}
                      >
                        {/* Greek Letter Display */}
                        <span className="text-5xl md:text-6xl font-black mb-1 font-serif tracking-tighter opacity-90">
                          {FLOW_GREEK_LETTERS[code] || code}
                        </span>

                        <div className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors
                          ${selection !== 'none' ? 'bg-white/80 shadow-sm text-gray-800' : 'bg-gray-100 text-gray-400'}
                        `}>
                          {getStatusLabel(selection)}
                        </div>
                      </button>

                      {/* Tooltip */}
                      <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center">
                        <div className="font-bold text-sm text-yellow-400 mb-1">{FLOW_NAMES[code]}</div>
                        <div className="text-gray-300 leading-snug">{FLOW_DESCRIPTIONS[code]}</div>
                        {/* Triangle */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Rules & Status */}
        <div className="lg:col-span-4 space-y-6">

          {direction ? (
            <div className="sticky top-8 space-y-6 animate-fade-in-up">

              {/* Visual Rules Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Έγκυροι Συνδυασμοί
                  </h4>
                  <p className="text-blue-100 text-xs mt-1">Επιλέξτε ΕΝΑΝ από τους παρακάτω συνδυασμούς:</p>
                </div>

                <div className="p-4 space-y-3 bg-gray-50/50">
                  {VISUAL_RULES[direction]?.map((rule) => (
                    <div key={rule.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 border-b pb-1">
                        {rule.description}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {rule.parts.map((part, pIdx) => (
                          <React.Fragment key={pIdx}>
                            <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2
                              ${isPartSatisfied(part)
                                ? (part.type === 'full' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-orange-100 border-orange-500 text-orange-800')
                                : (part.type === 'full' ? 'bg-gray-50 border-gray-200 text-gray-400 border-dashed' : 'bg-gray-50 border-gray-200 text-gray-400 border-dotted')
                              }
                            `}>
                              {part.code !== 'ANY' ? (
                                <span className="font-bold font-serif text-lg leading-none">{FLOW_GREEK_LETTERS[part.code]}</span>
                              ) : (
                                <span className="font-bold text-xs leading-none">?</span>
                              )}
                            </div>
                            {pIdx < rule.parts.length - 1 && <span className="text-gray-300 font-bold">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500">
                        {rule.parts.map(p => p.label || (p.code !== 'ANY' ? `${p.type === 'full' ? 'Ολόκληρη' : 'Μισή'} ${FLOW_NAMES[p.code]}` : '')).join(' + ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Status & Action */}
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm
                ${validation.isValid
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-red-100'}
              `}>
                <div className="flex items-start gap-3 mb-5">
                  <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${validation.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {validation.isValid
                      ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    }
                  </div>
                  <div>
                    <h5 className={`font-bold text-base ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {validation.isValid ? 'Έγκυρη Επιλογή' : 'Απαιτείται Διόρθωση'}
                    </h5>
                    {!validation.isValid && (
                      <p className="text-sm text-red-600 mt-1 leading-relaxed font-medium">
                        {validation.error}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!validation.isValid}
                  className={`w-full py-4 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2
                    ${validation.isValid
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  Επόμενο Βήμα
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <div className="max-w-xs">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-medium text-gray-500">Οδηγίες</p>
                <p className="text-sm mt-2">Επιλέξτε πρώτα κατεύθυνση από αριστερά για να δείτε τους κανόνες και τις διαθέσιμες ροές.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Step1Strategy;
