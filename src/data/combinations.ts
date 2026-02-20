import type { FlowSelection } from '../utils/flowValidation';

export interface CombinationOption {
  type: 'select_one_full' | 'any_ge_half';
  allowedCodes?: string[];
  excludeCodes?: string[];
}

export interface Combination {
  id: string;
  label: string;
  required: Record<string, FlowSelection>; // e.g., { 'H': 'full', 'Y': 'full' }
  option: CombinationOption;
}

export const COMBINATIONS: Record<string, Combination[]> = {
  Electronics: [
    {
      id: 'h_y_other',
      label: 'Ολόκληρη Η + Ολόκληρη Υ + τουλάχιστον ½ άλλη',
      required: { 'H': 'full', 'Y': 'full' },
      option: { type: 'any_ge_half', excludeCodes: ['H', 'Y'] }
    },
    {
      id: 'h_s_other',
      label: 'Ολόκληρη Η + Ολόκληρη Σ + τουλάχιστον ½ άλλη',
      required: { 'H': 'full', 'S': 'full' },
      option: { type: 'any_ge_half', excludeCodes: ['H', 'S'] }
    },
    {
      id: 'h_full_s_half_other',
      label: 'Ολόκληρη Η + Μισή Σ + {Ολόκληρη Υ ή Τ ή Ζ}',
      required: { 'H': 'full', 'S': 'half' },
      option: { type: 'select_one_full', allowedCodes: ['Y', 'T', 'Z'] }
    },
    {
      id: 'h_half_s_full_other',
      label: 'Μισή Η + Ολόκληρη Σ + {Ολόκληρη Λ ή Δ ή Ε}',
      required: { 'H': 'half', 'S': 'full' },
      option: { type: 'select_one_full', allowedCodes: ['L', 'D', 'E'] }
    },
  ],
  Informatics: [
    {
      id: 'y_l_other',
      label: 'Ολόκληρη Υ + Ολόκληρη Λ + τουλάχιστον ½ άλλη',
      required: { 'Y': 'full', 'L': 'full' },
      option: { type: 'any_ge_half', excludeCodes: ['Y', 'L'] }
    },
    {
      id: 'y_full_l_half_other',
      label: 'Ολόκληρη Υ + Μισή Λ + {Ολόκληρη Δ ή Σ}',
      required: { 'Y': 'full', 'L': 'half' },
      option: { type: 'select_one_full', allowedCodes: ['D', 'S'] }
    },
    {
      id: 'y_half_l_full_other',
      label: 'Μισή Υ + Ολόκληρη Λ + {Ολόκληρη Δ ή Σ}',
      required: { 'Y': 'half', 'L': 'full' },
      option: { type: 'select_one_full', allowedCodes: ['D', 'S'] }
    },
  ],
  Communications: [
    {
      id: 't_d_other',
      label: 'Ολόκληρη Τ + Ολόκληρη Δ + τουλάχιστον ½ άλλη',
      required: { 'T': 'full', 'D': 'full' },
      option: { type: 'any_ge_half', excludeCodes: ['T', 'D'] }
    },
    {
      id: 't_full_d_half_other',
      label: 'Ολόκληρη Τ + Μισή Δ + {Ολόκληρη Η ή Σ}',
      required: { 'T': 'full', 'D': 'half' },
      option: { type: 'select_one_full', allowedCodes: ['H', 'S'] }
    },
    {
      id: 't_half_d_full_other',
      label: 'Μισή Τ + Ολόκληρη Δ + {Ολόκληρη Υ ή Λ ή Σ}',
      required: { 'T': 'half', 'D': 'full' },
      option: { type: 'select_one_full', allowedCodes: ['Y', 'L', 'S'] }
    },
  ],
  Energy: [
    {
      id: 'e_z_other',
      label: 'Ολόκληρη Ε + Ολόκληρη Ζ + τουλάχιστον ½ άλλη',
      required: { 'E': 'full', 'Z': 'full' },
      option: { type: 'any_ge_half', excludeCodes: ['E', 'Z'] }
    },
    {
      id: 'e_full_z_half_other',
      label: 'Ολόκληρη Ε + Μισή Ζ + {Ολόκληρη Τ ή Δ ή Σ}',
      required: { 'E': 'full', 'Z': 'half' },
      option: { type: 'select_one_full', allowedCodes: ['T', 'D', 'S'] }
    },
    {
      id: 'e_half_z_full_other',
      label: 'Μισή Ε + Ολόκληρη Ζ + {Ολόκληρη Υ ή Η ή Σ}',
      required: { 'E': 'half', 'Z': 'full' },
      option: { type: 'select_one_full', allowedCodes: ['Y', 'H', 'S'] }
    },
  ],
};
