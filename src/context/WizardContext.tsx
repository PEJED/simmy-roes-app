import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { validateDirectionSelection, type FlowSelection, type Direction } from '../utils/flowValidation';
import { courses } from '../data/courses';

interface WizardState {
  step: number;
  direction: Direction | null;
  selectedCombinationId: string | null;
  flowSelections: Record<string, FlowSelection>; // e.g. { 'Y': 'full', 'L': 'half' }
  selectedCourseIds: string[];
  gpa: number | null;
}

interface WizardContextType extends WizardState {
  setStep: (step: number) => void;
  setDirection: (direction: Direction | null) => void;
  setSelectedCombinationId: (id: string | null) => void;
  setFlowSelection: (flowCode: string, selection: FlowSelection) => void;
  resetFlowSelections: () => void;
  toggleCourse: (courseId: string) => void;
  setGpa: (gpa: number | null) => void;
  validation: { isValid: boolean; error: string | null };
  lockedCourseIds: string[];
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [selectedCombinationId, setSelectedCombinationId] = useState<string | null>(null);
  const [flowSelections, setFlowSelections] = useState<Record<string, FlowSelection>>({});
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [gpa, setGpa] = useState<number | null>(null);

  const validation = useMemo(() => {
    if (!direction) return { isValid: false, error: 'Επιλέξτε Κατεύθυνση' };
    return validateDirectionSelection(direction, flowSelections);
  }, [direction, flowSelections]);

  const lockedCourseIds = useMemo(() => {
    const ids: string[] = [];
    Object.entries(flowSelections).forEach(([flowCode, selection]) => {
      if (selection === 'full') {
        // Lock all compulsory courses for Full Flows
        const compulsoryCourses = courses.filter(
          c => c.flow_code === flowCode && c.is_flow_compulsory
        );
        compulsoryCourses.forEach(c => ids.push(c.id.toString()));
      }
    });
    return ids;
  }, [flowSelections]);

  // Auto-select locked courses
  useEffect(() => {
    if (lockedCourseIds.length > 0) {
      setSelectedCourseIds(prev => {
        const newSet = new Set(prev);
        lockedCourseIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    }
  }, [lockedCourseIds]);

  const setFlowSelectionHandler = (flowCode: string, selection: FlowSelection) => {
    setFlowSelections(prev => ({
      ...prev,
      [flowCode]: selection
    }));
  };

  const resetFlowSelections = () => {
    setFlowSelections({});
  };

  const toggleCourse = (courseId: string) => {
    if (lockedCourseIds.includes(courseId)) return; // Prevent toggling locked courses

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
    gpa,
    setStep,
    setDirection,
    setSelectedCombinationId,
    setFlowSelection: setFlowSelectionHandler,
    resetFlowSelections,
    toggleCourse,
    setGpa,
    validation,
    lockedCourseIds
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
