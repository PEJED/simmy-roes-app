import React, { createContext, useContext, useState, useMemo } from 'react';
import { validateDirectionSelection } from '../utils/flowValidation';
import type { FlowSelection, Direction } from '../utils/flowValidation';

interface WizardState {
  step: number;
  direction: Direction | null;
  selectedCombinationId: string | null;
  flowSelections: Record<string, FlowSelection>; // e.g. { 'Y': 'full', 'L': 'half' }
  selectedCourseIds: string[];
}

interface WizardContextType extends WizardState {
  setStep: (step: number) => void;
  setDirection: (direction: Direction) => void;
  setSelectedCombinationId: (id: string | null) => void;
  setFlowSelection: (flowCode: string, selection: FlowSelection) => void;
  resetFlowSelections: () => void;
  toggleCourse: (courseId: string) => void;
  validation: { isValid: boolean; error: string | null };
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<string | null>(null);
  const [flowSelections, setFlowSelections] = useState<Record<string, FlowSelection>>({});
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const validation = useMemo(() => {
    // Only check validity if direction is selected
    if (!direction) return { isValid: false, error: 'Επιλέξτε Κατεύθυνση' };

    // Check flow structure
    // We pass the flowSelections to the utility
    return validateDirectionSelection(direction, flowSelections);
  }, [direction, flowSelections]);

  const setFlowSelection = (flowCode: string, selection: FlowSelection) => {
    setFlowSelections(prev => ({
      ...prev,
      [flowCode]: selection
    }));
  };

  const resetFlowSelections = () => {
    setFlowSelections({});
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const value = {
    step,
    direction,
    selectedCombinationId,
    flowSelections,
    selectedCourseIds,
    setStep,
    setDirection,
    setSelectedCombinationId,
    setFlowSelection,
    resetFlowSelections,
    toggleCourse,
    validation
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
