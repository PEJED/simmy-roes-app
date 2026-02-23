import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';
import { COMBINATIONS, type Combination } from '../../data/combinations';
import { FLOW_NAMES, FLOW_DESCRIPTIONS, FLOW_DETAILS, DIRECTION_INFO, type FlowSelection } from '../../utils/flowValidation';

const Step2Flows: React.FC = () => {
  const {
    direction,
    selectedCombinationId,
    setSelectedCombinationId,
    flowSelections,
    setFlowSelection,
    resetFlowSelections,
    setStep
  } = useWizard();

  const [showFlowInfo, setShowFlowInfo] = useState(false);

  if (!direction) return <div>No direction selected</div>;

  const combinations = COMBINATIONS[direction];

  const handleCombinationSelect = (combId: string) => {
    if (selectedCombinationId === combId) return;

    setSelectedCombinationId(combId);
    resetFlowSelections();

    const comb = combinations.find(c => c.id === combId);
    if (comb) {
      Object.entries(comb.required).forEach(([code, sel]) => {
        setFlowSelection(code, sel);
      });
    }
  };

  const currentComb = combinations.find(c => c.id === selectedCombinationId);

  const getAvailableFlows = (comb: Combination) => {
    const exclude = [...Object.keys(comb.required), ...(comb.option.excludeCodes || [])];
    return Object.keys(FLOW_NAMES).filter(code =>
      !exclude.includes(code) &&
      !['K', 'X', 'G', 'M', 'F'].includes(code)
    );
  };

  const getAllowedFlows = (comb: Combination) => {
     return comb.option.allowedCodes || [];
  };

  const handleOtherFlowChange = (code: string, selection: FlowSelection) => {
    if (currentComb?.option.type === 'select_one_full') {
        // If selecting full, deselect others first
        if (selection === 'full') {
            const requiredCodes = Object.keys(currentComb?.required || {});
            Object.keys(flowSelections).forEach(c => {
               if (!requiredCodes.includes(c) && c !== code) {
                   setFlowSelection(c, 'none');
               }
            });
            setFlowSelection(code, 'full');
        } else {
            setFlowSelection(code, 'none');
        }
        return;
    }
    setFlowSelection(code, selection);
  };

  const isOtherSatisfied = () => {
    if (!currentComb) return false;

    const requiredCodes = Object.keys(currentComb.required);
    const otherFlows = Object.entries(flowSelections).filter(([code, sel]) =>
      !requiredCodes.includes(code) && sel !== 'none'
    );

    if (currentComb.option.type === 'select_one_full') {
       // Must have exactly one other flow selected as FULL
       const match = otherFlows.find(([code, sel]) =>
         currentComb.option.allowedCodes?.includes(code) && sel === 'full'
       );
       return !!match && otherFlows.length === 1;
    }

    if (currentComb.option.type === 'any_ge_half') {
       const fullCount = otherFlows.filter(([, s]) => s === 'full').length;
       const halfCount = otherFlows.filter(([, s]) => s === 'half').length;

       if (fullCount === 1 && halfCount === 0) return true;
       if (fullCount === 0 && halfCount === 1) return true;
       if (fullCount === 0 && halfCount === 2) return true;

       return false;
    }

    return false;
  };

  // Helper to determine if an option should be disabled
  const isOptionDisabled = (code: string, type: 'full' | 'half') => {
      // 1. Logic for "Any GE Half" (Select at least 1/2)
      if (currentComb && currentComb.option.type === 'any_ge_half') {
          const requiredCodes = Object.keys(currentComb.required);
          const otherFlows = Object.entries(flowSelections).filter(([c, s]) =>
            !requiredCodes.includes(c) && s !== 'none'
          );

          const others = otherFlows.filter(([c]) => c !== code);

          const fullCount = others.filter(([, s]) => s === 'full').length;
          const halfCount = others.filter(([, s]) => s === 'half').length;

          if (type === 'full') {
              // Can select Full if 0 Fulls AND 0 Halves exist elsewhere
              return fullCount > 0 || halfCount > 0;
          }
          if (type === 'half') {
              // Can select Half if 0 Fulls exist AND < 2 Halves exist elsewhere
              return fullCount > 0 || halfCount >= 2;
          }
      }

      // 2. Logic for "Select One Full" (from allowed list)
      if (currentComb && currentComb.option.type === 'select_one_full') {
           // Only allow selecting FULL
           if (type === 'half') return true;

           // If another is already selected, disabling isn't strictly necessary as logic handles switch
           // but we can disable strictly if desired. Here we allow switch.
           return false;
      }

      return false;
  };

  const canContinue = currentComb && isOtherSatisfied();

  const getGreekName = (code: string) => {
      return FLOW_NAMES[code] || code;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-4">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Επιλογή Συνδυασμού Ροών</h2>
        <p className="text-gray-600 text-base mb-4 font-medium">
          Κατεύθυνση: <span className="text-blue-700 underline decoration-blue-300 underline-offset-4">{DIRECTION_INFO[direction].name}</span>
        </p>

        <button
          onClick={() => setShowFlowInfo(true)}
          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 px-4 py-2 rounded-full transition-all inline-flex items-center gap-2 shadow-sm border border-indigo-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Πληροφορίες Ροών
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combinations.map(comb => {
           const isSelected = selectedCombinationId === comb.id;
           return (
             <div
               key={comb.id}
               onClick={() => handleCombinationSelect(comb.id)}
               className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex items-center gap-4 ${
                 isSelected
                 ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-white shadow-lg scale-[1.02]'
                 : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
               }`}
             >
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 items-center justify-center transition-colors flex ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>

                <span className={`text-base font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                  {comb.label}
                </span>
             </div>
           );
        })}
      </div>

      {currentComb && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8 animate-in zoom-in-95 duration-300 mt-10 ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Διαμόρφωση Ροών</h3>
            <span className="text-[10px] font-bold px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-sm">Βήμα 2/3</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_2fr] gap-6">
             {/* Required Flows */}
             {Object.entries(currentComb.required).map(([code, sel]) => (
               <div key={code} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 flex flex-col h-full shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-bl-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                 <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider text-gray-500 bg-gray-200/80 uppercase mb-3 self-start z-10 backdrop-blur-sm">Υποχρεωτικη</span>
                 <div className="text-xl font-black text-gray-900 leading-tight mb-4 z-10">{getGreekName(code)}</div>

                 <div className="mt-auto flex items-center text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-1.5 rounded-lg self-start z-10">
                   {sel === 'full' ? 'Ολόκληρη' : 'Μισή'}
                 </div>
               </div>
             ))}

             {/* "Other" Flow Selector */}
             <div className="p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 flex flex-col h-full relative overflow-hidden shadow-sm">
               <div className="absolute inset-0 bg-white/40"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider text-indigo-700 bg-indigo-100/80 uppercase mb-3 self-start backdrop-blur-sm border border-indigo-200">
                   Επιπλεον Επιλογη
                 </span>

                 <div className="flex-1 flex flex-col">
                    <div className="text-xs text-indigo-900 font-semibold mb-4 bg-white/60 p-2 rounded-lg border border-indigo-100/50">
                       {currentComb.option.type === 'any_ge_half'
                         ? <span>Επιλέξτε: <span className="text-indigo-700">1 Ολόκληρη</span> ή <span className="text-indigo-700">1 Μισή</span> ή <span className="text-indigo-700">2 Μισές</span></span>
                         : <span>Επιλέξτε: <span className="text-indigo-700">1 Ολόκληρη</span> από τις διαθέσιμες</span>
                       }
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                       {(currentComb.option.type === 'select_one_full' ? getAllowedFlows(currentComb) : getAvailableFlows(currentComb)).map(code => {
                          const selection = flowSelections[code] || 'none';
                          const isFullOnly = ['I', 'O'].includes(code) || currentComb.option.type === 'select_one_full';

                          const disabledFull = isOptionDisabled(code, 'full');
                          const disabledHalf = isOptionDisabled(code, 'half');

                          return (
                             <div key={code} className={`p-3 rounded-xl border transition-all duration-200 ${
                                 selection !== 'none'
                                 ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100 scale-[1.02]'
                                 : 'bg-white/70 border-indigo-100 hover:border-indigo-300 hover:bg-white'
                             }`}>
                                 <div className="font-bold text-xs text-gray-800 mb-2 text-center truncate" title={FLOW_NAMES[code]}>
                                   {getGreekName(code)}
                                 </div>
                                 <div className="flex gap-1.5 justify-center">
                                     {!isFullOnly && (
                                          <button
                                              disabled={disabledHalf}
                                              onClick={() => handleOtherFlowChange(code, selection === 'half' ? 'none' : 'half')}
                                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border w-10 ${
                                                  selection === 'half'
                                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                  : disabledHalf
                                                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                                                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                                              }`}
                                          >
                                              ½
                                          </button>
                                     )}
                                     <button
                                         disabled={disabledFull}
                                         onClick={() => handleOtherFlowChange(code, selection === 'full' ? 'none' : 'full')}
                                         className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                            selection === 'full'
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                            : disabledFull
                                                ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                                         }`}
                                     >
                                         Full
                                     </button>
                                 </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Flow Info Modal */}
      {showFlowInfo && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowFlowInfo(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Επεξήγηση Ροών</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Ανάλυση αντικειμένου για κάθε ροή σπουδών.</p>
              </div>
              <button
                onClick={() => setShowFlowInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-800"
              >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid gap-4">
              {Object.entries(FLOW_NAMES).map(([code, name]) => {
                 if (['X', 'K'].includes(code)) return null;
                 return (
                   <div key={code} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide group-hover:border-indigo-200 group-hover:text-indigo-700">{name}</span>
                         <h4 className="font-bold text-gray-900 text-sm md:text-base">{FLOW_DESCRIPTIONS[code]}</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed ml-1">
                        {FLOW_DETAILS[code] || "Δεν υπάρχει διαθέσιμη περιγραφή."}
                      </p>
                   </div>
                 )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-8 border-t border-gray-200">
        <button
          onClick={() => {
             setStep(1);
             setSelectedCombinationId(null);
             resetFlowSelections();
          }}
          className="px-6 py-3 rounded-2xl font-bold text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Πίσω
        </button>
        <button
          disabled={!canContinue}
          onClick={() => setStep(3)}
          className={`px-10 py-3 rounded-2xl font-bold text-sm text-white shadow-xl transition-all flex items-center gap-2 transform active:scale-95 ${
            canContinue
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 shadow-blue-200'
              : 'bg-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          Συνέχεια
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step2Flows;
