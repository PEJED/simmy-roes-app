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
      description: "3222, 3016, 3256, 3310",
      compulsory: ['605', '4018', '3256', '3310'],
      strict: true
    },
    half: {
      description: "3222, 3016, 3310",
      compulsory: ['605', '4018', '3310'],
      strict: true
    }
  },
  'D': {
    full: {
      description: "3299, 3248, 3298, 3346",
      compulsory: ['4000', '3248', '3298', '3346'],
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
          description: "3299, 3298, 3346",
          compulsory: ['4000', '3298', '3346'],
          strict: true
      };
    }
  },
  'T': {
    full: {
      description: "3338, 3057, 3300, 3058",
      compulsory: ['705', '4001', '4019', '4039'],
      strict: true
    },
    half: {
      description: "τρία εκ των 3338, 3057, 3300, 3058",
      pool: ['705', '4001', '4019', '4039'],
      required_count: 3,
      strict: true
    }
  },
  'S': {
    full: {
      description: "3171, 3149, 3305 και 3304 ή 3333",
      compulsory: ['704', '4003', '4024'],
      options: [['4023', '4070']],
      strict: true
    },
    half: {
      description: "3171, 3149, 3305",
      compulsory: ['704', '4003', '4024'],
      strict: true
    }
  },
  'Z': {
    full: {
      description: "3290, 3127, 3101 και 3307 ή 3047",
      compulsory: ['4005', '609', '4025'],
      options: [['4026', '4027', '4072', '4073', '4074']],
      strict: true
    },
    half: {
      description: "3290, 3101, 3127",
      compulsory: ['4005', '4025', '609'],
      strict: true
    }
  },
  'E': {
    full: {
      description: "3074, 3246, 3308, 3313",
      compulsory: ['4006', '4007', '4028', '4052'],
      strict: true
    },
    half: {
      description: "3074, 3246, 3308",
      compulsory: ['4006', '4007', '4028'],
      strict: true
    }
  },
  'O': {
    full: {
      description: "τέσσερα εκ των 3292, 3196, 3306, 3260, 3334",
      pool: ['4009', '4010', '4031', '4055', '4056'],
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 3292, 3196, 3306, 3260",
      pool: ['4009', '4010', '4031', '4055'],
      required_count: 3,
      strict: true
    }
  },
  'I': {
    full: {
      description: "3259 ή 3392 και 3336, 3350, 3326",
      compulsory: ['4012', '4035', '4082'],
      options: [['4011', '4013']],
      strict: true
    },
    half: {
      description: "3259 ή 3392 και 3336, 3350",
      compulsory: ['4012', '4035'],
      options: [['4011', '4013']],
      strict: true
    }
  }
};
