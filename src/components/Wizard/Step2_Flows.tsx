import React from 'react';
import { useWizard } from '../../context/WizardContext';
import { COMBINATIONS, type Combination } from '../../data/combinations';
import { FLOW_NAMES, type FlowSelection } from '../../utils/flowValidation';

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
    // This is tricky. We need to identify which flow is the "Other" flow.
    // Simpler approach:
    // 1. Identify all currently selected flows.
    // 2. Identify required flows.
    // 3. The difference is the "Other" flows (and possibly I/O).

    // Better: Just set the new one. If we only allow ONE "Other", we should clear others first?
    // User might want I/O as well.
    // So we don't automatically clear unless it conflicts.

    // For the dropdown, we select ONE flow. So we clear the previous value of the dropdown?
    // No, we just set the new code to 'full'/'half' and set the old code to 'none'.
    // BUT we don't know the old code easily without state.
    // So let's iterate and clear all flows that are NOT required and NOT I/O (if I/O is handled separately).

    const requiredCodes = Object.keys(currentComb?.required || {});

    // We want to clear all flows that are:
    // 1. Not required
    // 2. Not the new code
    // 3. Not I/O (if we treat them as separate add-ons) - Let's say we don't clear I/O for now.

    Object.keys(flowSelections).forEach(c => {
       if (!requiredCodes.includes(c) && c !== code && !['I', 'O'].includes(c)) {
           setFlowSelection(c, 'none');
       }
    });

    setFlowSelection(code, selection);
  };

  const handleExtraFlowToggle = (code: string) => {
    // Toggle I or O between 'none' and 'full'
    // They can be added on top.
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
       // The excludeCodes are already handled by getAvailableFlows logic or UI
       return otherFlows.length > 0; // Simplified.
    }

    return false;
  };

  const canContinue = currentComb && isOtherSatisfied();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Επιλογή Συνδυασμού Ροών</h2>
        <p className="text-gray-600 mb-4">
          Επιλέξτε έναν από τους έγκυρους συνδυασμούς για την κατεύθυνση <strong>{direction}</strong>.
        </p>

        <div className="space-y-3">
          {combinations.map(comb => (
             <div
               key={comb.id}
               onClick={() => handleCombinationSelect(comb.id)}
               className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                 selectedCombinationId === comb.id
                 ? 'border-blue-600 bg-blue-50'
                 : 'border-gray-200 hover:bg-gray-50'
               }`}
             >
               <div className="flex items-center">
                 <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                    selectedCombinationId === comb.id ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                 }`}>
                    {selectedCombinationId === comb.id && <div className="w-2 h-2 rounded-full bg-white" />}
                 </div>
                 <span className="font-medium text-gray-900">{comb.label}</span>
               </div>
             </div>
          ))}
        </div>
      </div>

      {currentComb && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Διαμόρφωση Ροών</h3>

          {/* Required Flows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {Object.entries(currentComb.required).map(([code, sel]) => (
               <div key={code} className="p-3 bg-gray-100 rounded border border-gray-200">
                 <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Υποχρεωτικη</span>
                 <div className="font-medium text-gray-900">{FLOW_NAMES[code]}</div>
                 <div className="text-sm text-blue-600">{sel === 'full' ? 'Ολόκληρη' : 'Μισή'}</div>
               </div>
             ))}

             {/* "Other" Flow Selector */}
             <div className="p-3 bg-blue-50 rounded border border-blue-200">
               <span className="block text-xs font-bold text-blue-500 uppercase mb-1">
                 {currentComb.option.type === 'any_ge_half' ? 'Επιλογη 3ης Ροης' : 'Επιλογη 3ης Ροης'}
               </span>
               <select
                 className="w-full mt-1 p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                 onChange={(e) => {
                    const [code, type] = e.target.value.split(':');
                    if (code) handleOtherFlowChange(code, type as FlowSelection);
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>Επιλέξτε ροή...</option>
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

          {/* Extra I/O Options */}
          <div className="mt-4 pt-4 border-t border-gray-100">
             <h4 className="text-sm font-semibold text-gray-700 mb-2">Προαιρετική Προσθήκη (Extra)</h4>
             <div className="flex gap-4">
               {['I', 'O'].map(code => {
                 // Don't show if already required or selected as "Other"
                 if (currentComb.required[code]) return null;

                 return (
                   <label key={code} className="flex items-center space-x-2 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={flowSelections[code] === 'full'}
                       onChange={() => handleExtraFlowToggle(code)}
                       className="rounded text-blue-600 focus:ring-blue-500"
                     />
                     <span className="text-sm text-gray-700">
                       Προσθήκη <strong>{FLOW_NAMES[code]}</strong> (Ολόκληρη)
                     </span>
                   </label>
                 );
               })}
             </div>
             <p className="text-xs text-gray-500 mt-1">
               * Οι ροές Ι (Βιοϊατρική) και Ο (Οικονομία) μπορούν να επιλεγούν επιπλέον ως Ολόκληρες.
             </p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={() => {
             setStep(1);
             setSelectedCombinationId(null);
             resetFlowSelections();
          }}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          &larr; Πίσω
        </button>
        <button
          disabled={!canContinue}
          onClick={() => setStep(3)}
          className={`px-8 py-2 rounded-lg font-semibold shadow-sm transition-all ${
            canContinue
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Συνέχεια στα Μαθήματα &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step2Flows;
