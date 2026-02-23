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
        const requiredCodes = Object.keys(currentComb?.required || {});
        Object.keys(flowSelections).forEach(c => {
           if (!requiredCodes.includes(c) && c !== code) {
               setFlowSelection(c, 'none');
           }
        });
        setFlowSelection(code, selection);
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

  const canContinue = currentComb && isOtherSatisfied();

  const getGreekName = (code: string) => {
      // FLOW_NAMES returns "Ροή X". We might want just "Ροή X" or customized.
      // Already correct format.
      return FLOW_NAMES[code] || code;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Επιλογή Συνδυασμού Ροών</h2>
        <p className="text-gray-600 text-sm mb-4">
          Κατεύθυνση: <span className="font-semibold text-blue-700">{DIRECTION_INFO[direction].name}</span>
        </p>

        <button
          onClick={() => setShowFlowInfo(true)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Τι είναι αυτές οι ροές;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {combinations.map(comb => {
           const isSelected = selectedCombinationId === comb.id;
           return (
             <div
               key={comb.id}
               onClick={() => handleCombinationSelect(comb.id)}
               className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group flex items-center gap-4 ${
                 isSelected
                 ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-200'
                 : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
               }`}
             >
                <div className={`w-5 h-5 rounded-full border flex-shrink-0 items-center justify-center transition-colors ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                  {comb.label}
                </span>
             </div>
           );
        })}
      </div>

      {currentComb && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 animate-in zoom-in-95 duration-300 mt-8">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-bold text-gray-800">Διαμόρφωση Ροών</h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Βήμα 2/3</span>
          </div>

          <div className={`grid grid-cols-1 ${currentComb.option.type === 'any_ge_half' ? 'lg:grid-cols-[1fr_1fr_2fr]' : 'sm:grid-cols-3'} gap-6`}>
             {/* Required Flows */}
             {Object.entries(currentComb.required).map(([code, sel]) => (
               <div key={code} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col h-full shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-gray-500 bg-gray-200 uppercase mb-2 self-start z-10">Υποχρεωτικη</span>
                 <div className="text-base font-bold text-gray-900 leading-tight mb-4 z-10">{getGreekName(code)}</div>

                 <div className="mt-auto flex items-center text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg self-start z-10">
                   {sel === 'full' ? 'Ολόκληρη' : 'Μισή'}
                 </div>
               </div>
             ))}

             {/* "Other" Flow Selector */}
             <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex flex-col h-full relative overflow-hidden shadow-sm">
               <div className="relative z-10 flex flex-col h-full">
                 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-blue-700 bg-blue-100 uppercase mb-2 self-start border border-blue-200">
                   Επιπλεον Επιλογη
                 </span>

                 {currentComb.option.type === 'any_ge_half' ? (
                   <div className="flex-1 flex flex-col">
                      <div className="text-xs text-blue-800 font-medium mb-3">
                         Επιλέξτε: <strong>1 Ολόκληρη</strong>, ή <strong>1 Μισή</strong>, ή <strong>2 Μισές</strong>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                         {getAvailableFlows(currentComb).map(code => {
                            const selection = flowSelections[code] || 'none';
                            const isFullOnly = ['I', 'O'].includes(code); // I and O are Full only

                            return (
                               <div key={code} className={`p-2 rounded-lg border transition-all ${
                                   selection !== 'none' ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-200' : 'bg-white/60 border-blue-200 hover:border-blue-400 hover:bg-white'
                               }`}>
                                   <div className="font-bold text-xs text-gray-800 mb-1.5 text-center truncate" title={FLOW_NAMES[code]}>
                                     {getGreekName(code)}
                                   </div>
                                   <div className="flex gap-1 justify-center">
                                       {!isFullOnly && (
                                            <button
                                                onClick={() => handleOtherFlowChange(code, selection === 'half' ? 'none' : 'half')}
                                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors border ${
                                                    selection === 'half'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                ½
                                            </button>
                                       )}
                                       <button
                                           onClick={() => handleOtherFlowChange(code, selection === 'full' ? 'none' : 'full')}
                                           className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-colors border ${
                                              selection === 'full'
                                              ? 'bg-indigo-600 text-white border-indigo-600'
                                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
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
                 ) : (
                   <div className="flex flex-col justify-center h-full">
                     <label className="block text-xs font-bold text-gray-700 mb-2">
                       Επιλέξτε μία ροή:
                     </label>
                     <select
                       className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-shadow"
                       onChange={(e) => {
                          const [code, type] = e.target.value.split(':');
                          if (code) handleOtherFlowChange(code, type as FlowSelection);
                       }}
                       value={
                          getAllowedFlows(currentComb).find(c => flowSelections[c] === 'full')
                          ? `${getAllowedFlows(currentComb).find(c => flowSelections[c] === 'full')}:full`
                          : ''
                       }
                     >
                       <option value="" disabled>-- Επιλογή --</option>
                       {getAllowedFlows(currentComb).map(code => (
                         <option key={code} value={`${code}:full`}>{getGreekName(code)} (Ολόκληρη)</option>
                       ))}
                     </select>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Flow Info Modal */}
      {showFlowInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFlowInfo(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Επεξήγηση Ροών</h3>
                <p className="text-sm text-gray-500 mt-1">Σύντομη περιγραφή του αντικειμένου κάθε ροής.</p>
              </div>
              <button
                onClick={() => setShowFlowInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
              >
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid gap-4">
              {Object.entries(FLOW_NAMES).map(([code, name]) => {
                 if (['X', 'K'].includes(code)) return null;
                 return (
                   <div key={code} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md uppercase tracking-wide">{name}</span>
                         <h4 className="font-bold text-gray-800 text-sm md:text-base">{FLOW_DESCRIPTIONS[code]}</h4>
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

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={() => {
             setStep(1);
             setSelectedCombinationId(null);
             resetFlowSelections();
          }}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Πίσω
        </button>
        <button
          disabled={!canContinue}
          onClick={() => setStep(3)}
          className={`px-8 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 ${
            canContinue
              ? 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-200'
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
