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
    { id: 'opt1', description: 'Επιλογή 1', parts: [{ code: 'H', type: 'full' }, { code: 'Y', type: 'full' }, { code: 'ANY', type: 'half', label: '+ Μισή Άλλη' }] },
    { id: 'opt1_alt', description: 'Επιλογή 1 (Εναλ.)', parts: [{ code: 'H', type: 'full' }, { code: 'S', type: 'full' }, { code: 'ANY', type: 'half', label: '+ Μισή Άλλη' }] },
    { id: 'opt2', description: 'Επιλογή 2', parts: [{ code: 'H', type: 'full' }, { code: 'S', type: 'half' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Υ/Τ/Ζ)' }] },
    { id: 'opt3', description: 'Επιλογή 3', parts: [{ code: 'H', type: 'half' }, { code: 'S', type: 'full' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Λ/Δ/Ε)' }] },
  ],
  Informatics: [
    { id: 'opt1', description: 'Επιλογή 1', parts: [{ code: 'Y', type: 'full' }, { code: 'L', type: 'full' }, { code: 'ANY', type: 'half', label: '+ Μισή Άλλη' }] },
    { id: 'opt2', description: 'Επιλογή 2', parts: [{ code: 'Y', type: 'full' }, { code: 'L', type: 'half' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Δ/Σ)' }] },
    { id: 'opt3', description: 'Επιλογή 3', parts: [{ code: 'Y', type: 'half' }, { code: 'L', type: 'full' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Δ/Σ)' }] },
  ],
  Communications: [
    { id: 'opt1', description: 'Επιλογή 1', parts: [{ code: 'T', type: 'full' }, { code: 'D', type: 'full' }, { code: 'ANY', type: 'half', label: '+ Μισή Άλλη' }] },
    { id: 'opt2', description: 'Επιλογή 2', parts: [{ code: 'T', type: 'full' }, { code: 'D', type: 'half' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Η/Σ)' }] },
    { id: 'opt3', description: 'Επιλογή 3', parts: [{ code: 'T', type: 'half' }, { code: 'D', type: 'full' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Υ/Λ/Σ)' }] },
  ],
  Energy: [
    { id: 'opt1', description: 'Επιλογή 1', parts: [{ code: 'E', type: 'full' }, { code: 'Z', type: 'full' }, { code: 'ANY', type: 'half', label: '+ Μισή Άλλη' }] },
    { id: 'opt2', description: 'Επιλογή 2', parts: [{ code: 'E', type: 'full' }, { code: 'Z', type: 'half' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Τ/Δ/Σ)' }] },
    { id: 'opt3', description: 'Επιλογή 3', parts: [{ code: 'E', type: 'half' }, { code: 'Z', type: 'full' }, { code: 'ANY', type: 'full', label: '+ Ολ. (Υ/Η/Σ)' }] },
  ],
};
