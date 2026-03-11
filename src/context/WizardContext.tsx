import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { validateDirectionSelection, type FlowSelection, type Direction } from '../utils/flowValidation';
import { FLOW_RULES } from '../data/flowRules';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SavedProfile {
  id: string;
  name: string;
  createdAt: string; // ISO date
  direction: Direction | null;
  selectedCombinationId: string | null;
  flowSelections: Record<string, FlowSelection>;
  selectedCourseIds: string[];
  step: number;
}

interface WizardState {
  step: number;
  direction: Direction | null;
  selectedCombinationId: string | null;
  flowSelections: Record<string, FlowSelection>;
  selectedCourseIds: string[];
  activeProfileId: string | null;
}

interface WizardContextType extends WizardState {
  setStep: (step: number) => void;
  setDirection: (direction: Direction | null) => void;
  setSelectedCombinationId: (id: string | null) => void;
  setFlowSelection: (flowCode: string, selection: FlowSelection) => void;
  resetFlowSelections: () => void;
  resetWizard: () => void;
  toggleCourse: (courseId: string) => void;
  validation: { isValid: boolean; error: string | null };
  lockedCourseIds: string[];
  // Profile management
  savedProfiles: SavedProfile[];
  activeProfileId: string | null;
  saveProfile: (name: string) => void;
  updateProfile: () => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
}

// ─── localStorage keys ────────────────────────────────────────────────────────

const CURRENT_STATE_KEY = 'simmy_current_state';
const PROFILES_KEY = 'simmy_profiles';

function loadCurrentState(): WizardState | null {
  try {
    const raw = localStorage.getItem(CURRENT_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}

function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProfile[];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialise from localStorage if available
  const persisted = loadCurrentState();

  const [step, setStepState] = useState(persisted?.step ?? 1);
  const [direction, setDirectionState] = useState<Direction | null>(persisted?.direction ?? null);
  const [selectedCombinationId, setSelectedCombinationIdState] = useState<string | null>(
    persisted?.selectedCombinationId ?? null
  );
  const [flowSelections, setFlowSelectionsState] = useState<Record<string, FlowSelection>>(
    persisted?.flowSelections ?? {}
  );
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    persisted?.selectedCourseIds ?? []
  );
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    persisted?.activeProfileId ?? null
  );

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(loadProfiles);

  // ── Auto-persist current state on every change ──────────────────────────────
  useEffect(() => {
    const state: WizardState = { step, direction, selectedCombinationId, flowSelections, selectedCourseIds, activeProfileId };
    try {
      localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify(state));
    } catch { /* storage full / private browsing */ }
  }, [step, direction, selectedCombinationId, flowSelections, selectedCourseIds, activeProfileId]);

  // ── Persist profiles list ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(savedProfiles));
    } catch { /* ignore */ }
  }, [savedProfiles]);

  // ── Setters (wrapped so we can keep the same API) ──────────────────────────
  const setStep = useCallback((s: number) => setStepState(s), []);
  const setDirection = useCallback((d: Direction | null) => setDirectionState(d), []);
  const setSelectedCombinationId = useCallback((id: string | null) => setSelectedCombinationIdState(id), []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validation = useMemo(() => {
    if (!direction) return { isValid: false, error: 'Επιλέξτε Κατεύθυνση' };
    return validateDirectionSelection(direction, flowSelections);
  }, [direction, flowSelections]);

  // ── Locked (compulsory) courses ────────────────────────────────────────────
  const lockedCourseIds = useMemo(() => {
    const ids: string[] = ['3035'];
    Object.entries(flowSelections).forEach(([flowCode, selection]) => {
      if (selection === 'none') return;
      let rule = FLOW_RULES[flowCode]?.[selection];
      if (typeof rule === 'function') rule = rule(direction);
      if (rule && rule.compulsory) rule.compulsory.forEach(id => ids.push(id));
    });
    return ids;
  }, [flowSelections, direction]);

  useEffect(() => {
    if (lockedCourseIds.length > 0) {
      setSelectedCourseIds(prev => {
        const newSet = new Set(prev);
        lockedCourseIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    }
  }, [lockedCourseIds]);

  // ── Flow selection handlers ────────────────────────────────────────────────
  const setFlowSelection = useCallback((flowCode: string, selection: FlowSelection) => {
    setFlowSelectionsState(prev => ({ ...prev, [flowCode]: selection }));
  }, []);

  const resetFlowSelections = useCallback(() => {
    setFlowSelectionsState({});
  }, []);

  const resetWizard = useCallback(() => {
    setStepState(1);
    setDirectionState(null);
    setSelectedCombinationIdState(null);
    setFlowSelectionsState({});
    setSelectedCourseIds([]);
    setActiveProfileId(null);
  }, []);

  const toggleCourse = useCallback((courseId: string) => {
    if (lockedCourseIds.includes(courseId)) return;
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  }, [lockedCourseIds]);

  // ── Profile CRUD ───────────────────────────────────────────────────────────
  const saveProfile = useCallback((name: string) => {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const profile: SavedProfile = {
      id: newId,
      name,
      createdAt: new Date().toISOString(),
      direction,
      selectedCombinationId,
      flowSelections,
      selectedCourseIds,
      step,
    };
    setSavedProfiles(prev => [profile, ...prev]);
    setActiveProfileId(newId);
  }, [direction, selectedCombinationId, flowSelections, selectedCourseIds, step]);

  const updateProfile = useCallback(() => {
    if (!activeProfileId) return;
    setSavedProfiles(prev => prev.map(p => p.id === activeProfileId ? {
      ...p,
      direction,
      selectedCombinationId,
      flowSelections,
      selectedCourseIds,
      step,
    } : p));
  }, [activeProfileId, direction, selectedCombinationId, flowSelections, selectedCourseIds, step]);

  const loadProfile = useCallback((id: string) => {
    const profile = savedProfiles.find(p => p.id === id);
    if (!profile) return;
    setDirectionState(profile.direction);
    setSelectedCombinationIdState(profile.selectedCombinationId);
    setFlowSelectionsState(profile.flowSelections);
    setSelectedCourseIds(profile.selectedCourseIds);
    setStepState(profile.step ?? (profile.selectedCombinationId ? 3 : profile.direction ? 2 : 1));
    setActiveProfileId(profile.id);
  }, [savedProfiles]);

  const deleteProfile = useCallback((id: string) => {
    setSavedProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  }, [activeProfileId]);

  // ─────────────────────────────────────────────────────────────────────────
  const value: WizardContextType = {
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
    resetWizard,
    toggleCourse,
    validation,
    lockedCourseIds,
    savedProfiles,
    activeProfileId,
    saveProfile,
    updateProfile,
    loadProfile,
    deleteProfile,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within a WizardProvider');
  return context;
};
