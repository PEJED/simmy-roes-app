import type { Direction } from '../utils/flowValidation';

export type RuleType = 'compulsory' | 'n_of' | 'one_of_groups';

export interface FlowRule {
  compulsory?: string[];
  min_count?: number; // For "X of Y"
  options?: string[][]; // For "A or B" (array of arrays, select at least one from each inner array?)
  // Actually, let's define a flexible structure
  // list: Array of (string | string[])
  // If string -> must match
  // If string[] -> must match at least one (OR logic)
  // But we also have "4 of [A, B, C, D, E]".
  // So:
  pool?: string[]; // The set to pick from
  required_count?: number; // How many from pool

  // Specific complex logic:
  // "Compulsory A, B, C AND (D or E)"
  // -> required: [A, B, C], one_of: [[D, E]]
}

export const FLOW_RULES: Record<string, { full: FlowRule; half: FlowRule | ((dir: Direction | null) => FlowRule) }> = {
  'Y': {
    full: {
      compulsory: ['3136', '3046', '3352'],
      options: [['3213', '3362']] // 3213 or 3362 (assuming 3362 is valid or ignored)
    },
    half: {
      compulsory: ['3136', '3046', '3352']
    }
  },
  'L': {
    full: {
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 4
    },
    half: {
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 3
    }
  },
  'H': {
    full: {
      compulsory: ['605', '4018', '3256', '3310'] // Mapped 3222->605, 3016->4018
    },
    half: {
      compulsory: ['605', '4018', '3310']
    }
  },
  'D': {
    full: {
      compulsory: ['4000', '3248', '3298', '3346'] // Mapped 3299->4000
    },
    half: (direction) => {
      if (direction === 'Informatics') {
        return { compulsory: ['3248', '3298', '3346'] };
      }
      return { compulsory: ['4000', '3298', '3346'] };
    }
  },
  'T': {
    full: {
      compulsory: ['705', '4001', '4019', '4039'] // Mapped
    },
    half: {
      pool: ['705', '4001', '4019', '4039'],
      required_count: 3
    }
  },
  'S': {
    full: {
      compulsory: ['704', '4003', '4024'], // Mapped
      options: [['4023', '4070']] // Mapped options
    },
    half: {
      compulsory: ['704', '4003', '4024']
    }
  },
  'Z': {
    full: {
      compulsory: ['4005', '609', '4025'], // Mapped
      options: [['4026', '4027']] // Mapped
    },
    half: {
      compulsory: ['4005', '4025', '609'] // 3127->609
    }
  },
  'E': {
    full: {
      compulsory: ['4006', '4007', '4028', '4052'] // Mapped
    },
    half: {
      compulsory: ['4006', '4007', '4028']
    }
  },
  'O': {
    full: {
      pool: ['4009', '4010', '4031', '4055', '4056'], // Mapped best guess
      required_count: 4
    },
    half: {
      pool: ['4009', '4010', '4031', '4055'], // Mapped best guess
      required_count: 3
    }
  },
  'I': {
    full: {
      compulsory: ['4012', '4035', '4082'], // Mapped
      options: [['4011', '4013']] // Mapped
    },
    half: {
      compulsory: ['4012', '4035'],
      options: [['4011', '4013']]
    }
  }
};
