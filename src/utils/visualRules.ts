import type { FlowSelection } from './flowValidation';

export const FLOW_GREEK_LETTERS: Record<string, string> = {
  'Y': 'Υ',
  'L': 'Λ',
  'D': 'Δ',
  'H': 'Η',
  'T': 'Τ',
  'S': 'Σ',
  'E': 'Ε',
  'Z': 'Ζ',
  'O': 'Ο',
  'I': 'Ι',
  'M': 'Μ',
  'F': 'Φ'
};

// Represents a valid rule structure for visual rendering
export interface RuleOption {
  id: string;
  parts: {
    code: string; // 'Y', 'L', etc.
    type: FlowSelection; // 'full' or 'half'
    label?: string; // e.g. "Any Other"
  }[];
  description: string;
}

export const VISUAL_RULES: Record<string, RuleOption[]> = {
  Electronics: [
    { id: 'opt1', description: 'Συνδυασμός Α', parts: [{ code: 'H', type: 'full' }, { code: 'ANY', type: 'full', label: 'Υ ή Σ' }, { code: 'ANY', type: 'half', label: '+ ½ Άλλη' }] },
    { id: 'opt2', description: 'Συνδυασμός Β', parts: [{ code: 'H', type: 'full' }, { code: 'S', type: 'half' }, { code: 'ANY', type: 'full', label: 'Υ ή Τ ή Ζ' }] },
    { id: 'opt3', description: 'Συνδυασμός Γ', parts: [{ code: 'H', type: 'half' }, { code: 'S', type: 'full' }, { code: 'ANY', type: 'full', label: 'Λ ή Δ ή Ε' }] },
  ],
  Informatics: [
    { id: 'opt1', description: 'Συνδυασμός Α', parts: [{ code: 'Y', type: 'full' }, { code: 'L', type: 'full' }, { code: 'ANY', type: 'half', label: '+ ½ Άλλη' }] },
    { id: 'opt2', description: 'Συνδυασμός Β', parts: [{ code: 'Y', type: 'full' }, { code: 'L', type: 'half' }, { code: 'ANY', type: 'full', label: 'Δ ή Σ' }] },
    { id: 'opt3', description: 'Συνδυασμός Γ', parts: [{ code: 'Y', type: 'half' }, { code: 'L', type: 'full' }, { code: 'ANY', type: 'full', label: 'Δ ή Σ' }] },
  ],
  Communications: [
    { id: 'opt1', description: 'Συνδυασμός Α', parts: [{ code: 'T', type: 'full' }, { code: 'D', type: 'full' }, { code: 'ANY', type: 'half', label: '+ ½ Άλλη' }] },
    { id: 'opt2', description: 'Συνδυασμός Β', parts: [{ code: 'T', type: 'full' }, { code: 'D', type: 'half' }, { code: 'ANY', type: 'full', label: 'Η ή Σ' }] },
    { id: 'opt3', description: 'Συνδυασμός Γ', parts: [{ code: 'T', type: 'half' }, { code: 'D', type: 'full' }, { code: 'ANY', type: 'full', label: 'Υ ή Λ ή Σ' }] },
  ],
  Energy: [
    { id: 'opt1', description: 'Συνδυασμός Α', parts: [{ code: 'E', type: 'full' }, { code: 'Z', type: 'full' }, { code: 'ANY', type: 'half', label: '+ ½ Άλλη' }] },
    { id: 'opt2', description: 'Συνδυασμός Β', parts: [{ code: 'E', type: 'full' }, { code: 'Z', type: 'half' }, { code: 'ANY', type: 'full', label: 'Τ ή Δ ή Σ' }] },
    { id: 'opt3', description: 'Συνδυασμός Γ', parts: [{ code: 'E', type: 'half' }, { code: 'Z', type: 'full' }, { code: 'ANY', type: 'full', label: 'Υ ή Η ή Σ' }] },
  ],
};
