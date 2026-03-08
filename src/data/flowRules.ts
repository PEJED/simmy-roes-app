import type { Direction } from '../utils/flowValidation';

export interface FlowRule {
  description?: string; // Human readable text
  compulsory?: string[];
  min_count?: number; // For "X of Y"
  pool?: string[]; // The set to pick from
  required_count?: number; // How many from pool
  options?: string[][]; // For "A or B" (OR logic groups)
  strict?: boolean; // If true, block selection after limit reached
}

export const FLOW_RULES: Record<string, { full: FlowRule; half: FlowRule | ((dir: Direction | null) => FlowRule) }> = {
  'Y': {
    full: {
      description: "3136, 3046, 3352 και 3213 ή 3362",
      compulsory: ['3136', '3046', '3352'],
      options: [['3213', '3362']],
      strict: true
    },
    half: {
      description: "3136, 3046, 3352",
      compulsory: ['3136', '3046', '3352'],
      strict: true
    }
  },
  'L': {
    full: {
      description: "τέσσερα εκ των 3061, 3123, 3287, 3105, 3205",
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 3061, 3123, 3287, 3105, 3205",
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 3,
      strict: true
    }
  },
  'H': {
    full: {
      description: "605, 4018, 3256, 3310",
      compulsory: ['3222', '3016', '3256', '3310'],
      strict: true
    },
    half: {
      description: "605, 4018, 3310",
      compulsory: ['605', '4018', '3310'],
      strict: true
    }
  },
  'D': {
    full: {
      description: "4000, 3248, 3298, 3346",
      compulsory: ['3299', '3248', '3298', '3346'],
      strict: true
    },
    half: (direction) => {
      if (direction === 'Informatics') {
        return {
            description: "3248, 3298, 3346",
            compulsory: ['3248', '3298', '3346'],
            strict: true
        };
      }
      return {
          description: "4000, 3298, 3346",
          compulsory: ['4000', '3298', '3346'],
          strict: true
      };
    }
  },
  'T': {
    full: {
      description: "705, 4001, 4019, 4039",
      compulsory: ['3057', '3338', '3300', '3058'],
      strict: true
    },
    half: {
      description: "τρία εκ των 705, 4001, 4019, 4039",
      pool: ['705', '4001', '4019', '4039'],
      required_count: 3,
      strict: true
    }
  },
  'S': {
    full: {
      description: "704, 4003, 4024 και 4023 ή 806",
      compulsory: ['3149', '3171', '3305'],
      options: [['3304', '3333']],
      strict: true
    },
    half: {
      description: "704, 4003, 4024",
      compulsory: ['704', '4003', '4024'],
      strict: true
    }
  },
  'Z': {
    full: {
      description: "4005, 609, 4025 και 4027 ή 4046",
      compulsory: ['3127', '3290', '3101'],
      options: [['3307', '3047']],
      strict: true
    },
    half: {
      description: "4005, 609, 4025",
      compulsory: ['4005', '609', '4025'],
      strict: true
    }
  },
  'E': {
    full: {
      description: "4006, 4007, 4028, 4052",
      compulsory: ['3074', '3246', '3308', '3313'],
      strict: true
    },
    half: {
      description: "4006, 4007, 4028",
      compulsory: ['4006', '4007', '4028'],
      strict: true
    }
  },
  'O': {
    full: {
      description: "τέσσερα εκ των 4009, 4010, 4031, 4055, 4080",
      pool: ['3196', '3292', '3306', '3260', '3334'],
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 4009, 4010, 4031, 4055, 4080",
      pool: ['4009', '4010', '4031', '4055', '4080'],
      required_count: 3,
      strict: true
    }
  },
  'I': {
    full: {
      description: "4012, 4035, 4082 και 4011 ή 4013",
      compulsory: ['3336', '3350', '3326'],
      options: [['3259', '3392']],
      strict: true
    },
    half: {
      description: "4012, 4035 και 4011 ή 4013",
      compulsory: ['4012', '4035'],
      options: [['4011', '4013']],
      strict: true
    }
  }
};
