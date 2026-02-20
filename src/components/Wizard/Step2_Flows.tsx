import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { COMBINATIONS, type Combination } from '../../data/combinations';
import { FLOW_NAMES, DIRECTION_INFO, type FlowSelection } from '../../utils/flowValidation';

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
      !['M', 'F', 'K', 'X'].includes(code) // Exclude Math, Physics, Core, None
    );
  };

  // Get available "allowed" flows for the restricted option
  const getAllowedFlows = (comb: Combination) => {
     return comb.option.allowedCodes || [];
  };

  const handleOtherFlowChange = (code: string, selection: FlowSelection) => {
    // Clear any previous "Other" selection that is NOT in the required set
    const requiredCodes = Object.keys(currentComb?.required || {});

    Object.keys(flowSelections).forEach(c => {
       if (!requiredCodes.includes(c) && c !== code && !['I', 'O'].includes(c)) {
           setFlowSelection(c, 'none');
       }
    });

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
    const otherFlows = Object.entries(flowSelections).filter(([code, sel]) =>
      !requiredCodes.includes(code) && sel !== 'none'
    );

    if (currentComb.option.type === 'select_one_full') {
       // Must have exactly one full from allowed list
       const match = otherFlows.find(([code, sel]) =>
         currentComb.option.allowedCodes?.includes(code) && sel === 'full'
       );
       return !!match;
    }

    if (currentComb.option.type === 'any_ge_half') {
       // Must have at least one half or full
       return otherFlows.length > 0;
    }

    return false;
  };

  const canContinue = currentComb && isOtherSatisfied();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Επιλογή Συνδυασμού Ροών</h2>
        <p className="text-gray-600">
          Για την κατεύθυνση <span className="font-semibold text-blue-700">{DIRECTION_INFO[direction].name}</span>, επιλέξτε έναν από τους παρακάτω έγκυρους συνδυασμούς.
        </p>
      </div>

      <div className="grid gap-4">
        {combinations.map(comb => {
           const isSelected = selectedCombinationId === comb.id;
           return (
             <div
               key={comb.id}
               onClick={() => handleCombinationSelect(comb.id)}
               className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                 isSelected
                 ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-200'
                 : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
               }`}
             >
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   {/* Custom Radio Button */}
                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                   }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                   </div>
                   <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                     {comb.label}
                   </span>
                 </div>
                 {isSelected && (
                    <span className="text-blue-600 font-semibold text-sm animate-in fade-in">Επιλεγμένο</span>
                 )}
               </div>
             </div>
           );
        })}
      </div>

      {currentComb && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8 animate-in zoom-in-95 duration-300 mt-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">Διαμόρφωση Ροών</h3>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Βήμα 2/3</span>
          </div>

          {/* Main Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Required Flows */}
             {Object.entries(currentComb.required).map(([code, sel]) => (
               <div key={code} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between h-full">
                 <div>
                   <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-gray-500 bg-gray-200 uppercase mb-2">Υποχρεωτικη</span>
                   <div className="text-lg font-bold text-gray-900 leading-tight">{FLOW_NAMES[code]}</div>
                 </div>
                 <div className="mt-3 flex items-center text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg self-start">
                   {sel === 'full' ? 'Ολόκληρη' : 'Μισή'}
                 </div>
               </div>
             ))}

             {/* "Other" Flow Selector */}
             <div className="p-4 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200 flex flex-col justify-between h-full relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8 z-0"></div>
               <div className="relative z-10">
                 <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-blue-600 bg-blue-100 uppercase mb-2">
                   {currentComb.option.type === 'any_ge_half' ? '3η Επιλογη' : '3η Επιλογη'}
                 </span>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Επιλέξτε την επιπλέον ροή σας
                 </label>
                 <select
                   className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                   onChange={(e) => {
                      const [code, type] = e.target.value.split(':');
                      if (code) handleOtherFlowChange(code, type as FlowSelection);
                   }}
                   defaultValue=""
                 >
                   <option value="" disabled>-- Επιλογή --</option>
                   {currentComb.option.type === 'any_ge_half' ? (
                     getAvailableFlows(currentComb).map(code => (
                       <React.Fragment key={code}>
                         {!['I', 'O'].includes(code) && (
                           <option value={`${code}:half`}>{FLOW_NAMES[code]} (Μισή)</option>
                         )}
                         <option value={`${code}:full`}>{FLOW_NAMES[code]} (Ολόκληρη)</option>
                       </React.Fragment>
                     ))
                   ) : (
                     getAllowedFlows(currentComb).map(code => (
                       <option key={code} value={`${code}:full`}>{FLOW_NAMES[code]} (Ολόκληρη)</option>
                     ))
                   )}
                 </select>
               </div>
             </div>
          </div>

          {/* Extra I/O Options */}
          <div className="pt-6 border-t border-gray-100">
             <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
               <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               Προαιρετικές Επιλογές (Extra)
             </h4>
             <div className="flex flex-wrap gap-4">
               {['I', 'O'].map(code => {
                 if (currentComb.required[code]) return null;
                 const isChecked = flowSelections[code] === 'full';

                 return (
                   <label key={code} className={`flex items-center space-x-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                     isChecked ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                   }`}>
                     <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'
                     }`}>
                        {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                     </div>
                     <input
                       type="checkbox"
                       checked={isChecked}
                       onChange={() => handleExtraFlowToggle(code)}
                       className="hidden"
                     />
                     <span className={`text-sm font-medium ${isChecked ? 'text-indigo-900' : 'text-gray-700'}`}>
                       Προσθήκη <strong>{FLOW_NAMES[code]}</strong> (Ολόκληρη)
                     </span>
                   </label>
                 );
               })}
             </div>
             <p className="text-xs text-gray-400 mt-3 italic">
               * Οι ροές Βιοϊατρικής και Οικονομίας προσφέρονται μόνο ως Ολόκληρες και μπορούν να συνδυαστούν με οποιοδήποτε πακέτο.
             </p>
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
          className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Πίσω
        </button>
        <button
          disabled={!canContinue}
          onClick={() => setStep(3)}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center gap-2 ${
            canContinue
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Συνέχεια στα Μαθήματα
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step2Flows;
