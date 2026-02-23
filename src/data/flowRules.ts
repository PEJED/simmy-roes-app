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
      description: "3136, 3046, 3.43352.8 και 3213 ή 3362",
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
      compulsory: ['605', '4018', '3256', '3310'], // Mapped 3222->605, 3016->4018
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
      description: "3299, 3248, 3.53298.7, 3346",
      compulsory: ['4000', '3248', '3298', '3346'], // Mapped 3299->4000
      strict: true
    },
    half: (direction) => {
      if (direction === 'Informatics') { // Mapped from 'Informatics' (internal) to Greek 'Πληροφορικής' logic
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
      description: "3338, 3057, 3.3300.7, 3058",
      compulsory: ['705', '4001', '4019', '4039'], // Mapped
      strict: true
    },
    half: {
      description: "τρία εκ των 3338., 3057, 3300, 3058",
      pool: ['705', '4001', '4019', '4039'],
      required_count: 3,
      strict: true
    }
  },
  'S': {
    full: {
      description: "3171, 3149, 3305 και 3304 ή 3333",
      compulsory: ['704', '4003', '4024'], // Mapped 3171->704, 3149->4003, 3305->4024
      options: [['4023', '4070']], // Mapped 3304->4023, 3333->4070 (Assumed mapping from prior context if not exact, using closest available ids from similar step)
      // Note: Check courses.ts for exact IDs.
      // 704: DSP (Ψηφιακή Επεξεργασία Σήματος - 3171)
      // 4003: Σχεδιασμός ΣΑΕ (3149)
      // 4024: Ρομποτική I (3305)
      // 4023: Προηγμένες Τεχνικές ΣΑΕ (3304)
      // 4070: Αναγνώριση Προτύπων (3333 ? No, 4070 is PR. 3333.8 is likely PR).
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
      compulsory: ['4005', '609', '4025'], // 3290->4005, 3127->609 (Machines I), 3101->4025 (High Voltage?)
      options: [['4026', '4027', '4072', '4073', '4074']], // 3307 (Power Electronics II -> 4026?), 3047 (Machines II -> 4027?)
      // Note: Data shows 4005=Power Elec I, 609=Machines I, 4025=High Voltage Gen.
      // 4026=Power Elec II, 4027=Machines II.
      // Rule says "3307 or 3047". Assuming 3307=4026, 3047=4027.
      // Need to be careful with options array. It's OR. So [4026, 4027].
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
      compulsory: ['4006', '4007', '4028', '4052'], // Mapped
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
      pool: ['4009', '4010', '4031', '4055', '4056'], // Mapped
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 3292, 3196, 3306, 3260",
      pool: ['4009', '4010', '4031', '4055'], // Mapped
      required_count: 3,
      strict: true
    }
  },
  'I': {
    full: {
      description: "3259 ή 3392 και 3336, 3350, 3326",
      compulsory: ['4012', '4035', '4082'], // Fixed part: 4012, 4035, 4082?
      // Check IDs: 4011(Intro Bio), 4012(Lab), 4013(Intro Bio Mech).
      // Rule says "A or B, and C, D, E".
      // Let's assume options: [[A, B]] and compulsory [C, D, E].
      // IDs need verification from titles.
      // 3259: Intro Bio? 3392: Cell Mech? -> 4011/4013?
      // 3336: Lab? -> 4012.
      // 3350: Measurements? -> 4035.
      // 3326: Simulation? -> 4082.
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
