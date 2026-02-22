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

    // Pre-fill required flows
    const comb = combinations.find(c => c.id === combId);
    if (comb) {
      Object.entries(comb.required).forEach(([code, sel]) => {
        setFlowSelection(code, sel);
      });
    }
  };

  const currentComb = combinations.find(c => c.id === selectedCombinationId);

  // Get available flows for the "Other" selection
  const getAvailableFlows = (comb: Combination) => {
    const exclude = [...Object.keys(comb.required), ...(comb.option.excludeCodes || [])];
    return Object.keys(FLOW_NAMES).filter(code =>
      !exclude.includes(code) &&
      !['K', 'X', 'G'].includes(code) // Exclude Non-flow items (G/X/K)
    );
  };

  // Get available "allowed" flows for the restricted option
  const getAllowedFlows = (comb: Combination) => {
     return comb.option.allowedCodes || [];
  };

  const handleOtherFlowChange = (code: string, selection: FlowSelection) => {
    // If strictly selecting one full flow (for options b/c), enforce single selection
    if (currentComb?.option.type === 'select_one_full') {
        const requiredCodes = Object.keys(currentComb?.required || {});
        Object.keys(flowSelections).forEach(c => {
           if (!requiredCodes.includes(c) && c !== code && !['I', 'O'].includes(c)) {
               setFlowSelection(c, 'none');
           }
        });
        setFlowSelection(code, selection);
        return;
    }

    // If 'any_ge_half' (option a), allow multi-selection (for Way 3: 2 Halfs)
    setFlowSelection(code, selection);
  };

  const handleExtraFlowToggle = (code: string) => {
    // Toggle I or O between 'none' and 'full'
    const current = flowSelections[code];
    setFlowSelection(code, current === 'full' ? 'none' : 'full');
  };

  // Check if we have satisfied the "Other" requirement
  const isOtherSatisfied = () => {
    if (!currentComb) return false;

    const requiredCodes = Object.keys(currentComb.required);
    // Filter flows that are NOT required and NOT I/O (I/O are special flows)
    const otherFlows = Object.entries(flowSelections).filter(([code, sel]) =>
      !requiredCodes.includes(code) && sel !== 'none' && !['I', 'O'].includes(code)
    );

    if (currentComb.option.type === 'select_one_full') {
       // Must have exactly one full from allowed list
       const match = otherFlows.find(([code, sel]) =>
         currentComb.option.allowedCodes?.includes(code) && sel === 'full'
       );
       return !!match && otherFlows.length === 1;
    }

    if (currentComb.option.type === 'any_ge_half') {
       const fullCount = otherFlows.filter(([, s]) => s === 'full').length;
       const halfCount = otherFlows.filter(([, s]) => s === 'half').length;

       // Way 1: 1 Full extra flow
       if (fullCount === 1 && halfCount === 0) return true;
       // Way 2: 1 Half extra flow
       if (fullCount === 0 && halfCount === 1) return true;
       // Way 3: 2 Half extra flows
       if (fullCount === 0 && halfCount === 2) return true;

       return false;
    }

    return false;
  };

  const canContinue = currentComb && isOtherSatisfied();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Επιλογή Συνδυασμού Ροών</h2>
        <p className="text-gray-600 text-sm mb-4">
          Κατεύθυνση: <span className="font-semibold text-blue-700">{DIRECTION_INFO[direction].name}</span>
        </p>

        <button
          onClick={() => setShowFlowInfo(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Τι είναι αυτές οι ροές;
        </button>
      </div>

      {/* Combinations Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {combinations.map(comb => {
           const isSelected = selectedCombinationId === comb.id;
           return (
             <div
               key={comb.id}
               onClick={() => handleCombinationSelect(comb.id)}
               className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 group flex items-center gap-3 ${
                 isSelected
                 ? 'border-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-200'
                 : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
               }`}
             >
                {/* Custom Radio Button - Smaller */}
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 items-center justify-center transition-colors ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>

                <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                  {comb.label}
                </span>

                {isSelected && (
                  <svg className="w-4 h-4 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
             </div>
           );
        })}
      </div>

      {currentComb && (
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 space-y-5 animate-in zoom-in-95 duration-300 mt-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">Διαμόρφωση</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">2/3</span>
          </div>

          {/* Main Flow Grid - Compact */}
          <div className={`grid grid-cols-1 ${currentComb.option.type === 'any_ge_half' ? 'md:grid-cols-[1fr_1fr_2fr]' : 'sm:grid-cols-3'} gap-4`}>
             {/* Required Flows */}
             {Object.entries(currentComb.required).map(([code, sel]) => (
               <div key={code} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between h-full">
                 <div>
                   <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-gray-500 bg-gray-200 uppercase mb-1">Υποχρεωτικη</span>
                   <div className="text-sm font-bold text-gray-900 leading-tight">{FLOW_NAMES[code]}</div>
                 </div>
                 <div className="mt-2 flex items-center text-xs font-medium text-blue-700 bg-blue-100/50 px-2 py-1 rounded self-start">
                   {sel === 'full' ? 'Ολόκληρη' : 'Μισή'}
                 </div>
               </div>
             ))}

             {/* "Other" Flow Selector */}
             <div className="p-3 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200 flex flex-col justify-between h-full relative overflow-hidden">
               <div className="relative z-10 flex flex-col h-full">
                 <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-blue-600 bg-blue-100 uppercase mb-1 self-start">
                   3η Επιλογη
                 </span>

                 {currentComb.option.type === 'any_ge_half' ? (
                   <div className="flex-1 overflow-hidden flex flex-col min-h-[140px]">
                      <div className="text-[10px] text-gray-500 italic mb-2">
                         Επιλέξτε: 1 Ολόκληρη, ή 1 Μισή, ή 2 Μισές
                      </div>
                      <div className="overflow-y-auto pr-1 flex-1 space-y-2 custom-scrollbar">
                         {getAvailableFlows(currentComb).map(code => {
                            if (['I', 'O'].includes(code)) return null;
                            const selection = flowSelections[code] || 'none';
                            return (
                               <div key={code} className="bg-white p-2 rounded border border-blue-100 text-xs">
                                   <div className="font-bold text-gray-700 mb-1 flex justify-between items-center">
                                     <span>{FLOW_NAMES[code]}</span>
                                   </div>
                                   <div className="flex gap-1">
                                       {['none', 'half', 'full'].map(opt => (
                                           <button
                                               key={opt}
                                               onClick={() => handleOtherFlowChange(code, opt as FlowSelection)}
                                               className={`flex-1 px-1 py-0.5 rounded text-[9px] uppercase font-bold transition-all border ${
                                                  selection === opt
                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                               }`}
                                           >
                                               {opt === 'none' ? '-' : opt === 'half' ? '1/2' : 'Full'}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col justify-center h-full">
                     <label className="block text-xs font-medium text-gray-700 mb-1">
                       Επιλέξτε ροή
                     </label>
                     <select
                       className="w-full p-2 bg-white border border-blue-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
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
                         <option key={code} value={`${code}:full`}>{FLOW_NAMES[code]} (Ολόκληρη)</option>
                       ))}
                     </select>
                   </div>
                 )}
               </div>
             </div>
          </div>

          {/* Extra I/O Options */}
          <div className="pt-4 border-t border-gray-100">
             <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               Extra
             </h4>
             <div className="flex flex-wrap gap-2">
               {['I', 'O'].map(code => {
                 if (currentComb.required[code]) return null;
                 const isChecked = flowSelections[code] === 'full';

                 return (
                   <label key={code} className={`flex items-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all ${
                     isChecked ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                   }`}>
                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'
                     }`}>
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                     </div>
                     <input
                       type="checkbox"
                       checked={isChecked}
                       onChange={() => handleExtraFlowToggle(code)}
                       className="hidden"
                     />
                     <span className={`text-xs font-medium ${isChecked ? 'text-indigo-900' : 'text-gray-700'}`}>
                       + {FLOW_NAMES[code]}
                     </span>
                   </label>
                 );
               })}
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
                 if (['X', 'K'].includes(code)) return null; // Skip non-flow items
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

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => {
             setStep(1);
             setSelectedCombinationId(null);
             resetFlowSelections();
          }}
          className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Πίσω
        </button>
        <button
          disabled={!canContinue}
          onClick={() => setStep(3)}
          className={`px-6 py-2 rounded-lg font-bold text-sm text-white shadow-sm transition-all flex items-center gap-1.5 ${
            canContinue
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
              : 'bg-gray-300 cursor-not-allowed'
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
