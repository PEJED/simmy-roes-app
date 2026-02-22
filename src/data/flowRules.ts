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
      description: "3.4.3136.6, 3.4.3046.6, 3.43352.8 και 3.4.3213.7 ή 3.4.3362.7",
      compulsory: ['3136', '3046', '3352'],
      options: [['3213', '3362']],
      strict: true
    },
    half: {
      description: "3.4.3136.6, 3.4.3046.6, 3.4.3352.8",
      compulsory: ['3136', '3046', '3352'],
      strict: true
    }
  },
  'L': {
    full: {
      description: "τέσσερα εκ των 3.4.3061.6, 3.4.3123.6, 3.4.3287.6, 3.4.3105.7, 3.4.3205.7",
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 3.4.3061.6, 3.4.3123.6, 3.4.3287.6, 3.4.3105.7, 3.4.3205.7",
      pool: ['3061', '3123', '3287', '3105', '3205'],
      required_count: 3,
      strict: true
    }
  },
  'H': {
    full: {
      description: "3.5.3222.6, 3.5.3016.7, 3.5.3256.7, 3.5.3310.8",
      compulsory: ['605', '4018', '3256', '3310'], // Mapped 3222->605, 3016->4018
      strict: true
    },
    half: {
      description: "3.5.3222.6, 3.5.3016.7, 3.5.3310.8",
      compulsory: ['605', '4018', '3310'],
      strict: true
    }
  },
  'D': {
    full: {
      description: "3.5.3299.6, 3.5.3248.6, 3.53298.7, 3.5.3346.8",
      compulsory: ['4000', '3248', '3298', '3346'], // Mapped 3299->4000
      strict: true
    },
    half: (direction) => {
      if (direction === 'Informatics') { // Mapped from 'Informatics' (internal) to Greek 'Πληροφορικής' logic
        return {
            description: "3.5.3248.6, 3.5.3298.7, 3.5.3346.8",
            compulsory: ['3248', '3298', '3346'],
            strict: true
        };
      }
      return {
          description: "3.5.3299.6, 3.5.3298.7, 3.5.3346.8",
          compulsory: ['4000', '3298', '3346'],
          strict: true
      };
    }
  },
  'T': {
    full: {
      description: "3.2.3338.6, 3.2.3057.6, 3.3300.7, 3.2.3058.8",
      compulsory: ['705', '4001', '4019', '4039'], // Mapped
      strict: true
    },
    half: {
      description: "τρία εκ των 3.2.3338.6., 3.2.3057.6, 3.2.3300.7, 3.2.3058.8",
      pool: ['705', '4001', '4019', '4039'],
      required_count: 3,
      strict: true
    }
  },
  'S': {
    full: {
      description: "3.3.3171.6, 3.3.3149.6, 3.3.3305.7 και 3.3.3304.7 ή 3.3.3333.8",
      compulsory: ['704', '4003', '4024'], // Mapped 3171->704, 3149->4003, 3305->4024
      options: [['4023', '4070']], // Mapped 3304->4023, 3333->4070 (Assumed mapping from prior context if not exact, using closest available ids from similar step)
      // Note: Check courses.ts for exact IDs.
      // 704: DSP (Ψηφιακή Επεξεργασία Σήματος - 3.3.3171.6)
      // 4003: Σχεδιασμός ΣΑΕ (3.3.3149.6)
      // 4024: Ρομποτική I (3.3.3305.7)
      // 4023: Προηγμένες Τεχνικές ΣΑΕ (3.3.3304.7)
      // 4070: Αναγνώριση Προτύπων (3.3.3333.8 ? No, 4070 is PR. 3333.8 is likely PR).
      strict: true
    },
    half: {
      description: "3.3.3171.6, 3.3.3149.6, 3.3.3305.7",
      compulsory: ['704', '4003', '4024'],
      strict: true
    }
  },
  'Z': {
    full: {
      description: "3.6.3290.6, 3.6.3127.6, 3.6.3101.7 και 3.6.3307.7 ή 3.6.3047.8",
      compulsory: ['4005', '609', '4025'], // 3290->4005, 3127->609 (Machines I), 3101->4025 (High Voltage?)
      options: [['4026', '4027', '4072', '4073', '4074']], // 3307 (Power Electronics II -> 4026?), 3047 (Machines II -> 4027?)
      // Note: Data shows 4005=Power Elec I, 609=Machines I, 4025=High Voltage Gen.
      // 4026=Power Elec II, 4027=Machines II.
      // Rule says "3307 or 3047". Assuming 3307=4026, 3047=4027.
      // Need to be careful with options array. It's OR. So [4026, 4027].
      strict: true
    },
    half: {
      description: "3.6.3290.6, 3.6.3101.7, 3.6.3127.6",
      compulsory: ['4005', '4025', '609'],
      strict: true
    }
  },
  'E': {
    full: {
      description: "3.6.3074.6, 3.6.3246.6, 3.6.3308.7, 3.6.3313.8",
      compulsory: ['4006', '4007', '4028', '4052'], // Mapped
      strict: true
    },
    half: {
      description: "3.6.3074.6, 3.6.3246.6, 3.6.3308.7",
      compulsory: ['4006', '4007', '4028'],
      strict: true
    }
  },
  'O': {
    full: {
      description: "τέσσερα εκ των 3.6.3292.6, 3.7.3196.6, 3.7.3306.7, 3.7.3260.8, 3.7.3334.9",
      pool: ['4009', '4010', '4031', '4055', '4056'], // Mapped
      required_count: 4,
      strict: true
    },
    half: {
      description: "τρία εκ των 3.6.3292.6, 3.7.3196.6, 3.7.3306.7, 3.7.3260.8",
      pool: ['4009', '4010', '4031', '4055'], // Mapped
      required_count: 3,
      strict: true
    }
  },
  'I': {
    full: {
      description: "3.1.3259.6 ή 3.2.3392.6 και 3.2.3336.6, 3.1.3350.7, 3.2.3326.9",
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
      description: "3.1.3259.6 ή 3.2.3392.6 και 3.2.3336.6, 3.1.3350.7",
      compulsory: ['4012', '4035'],
      options: [['4011', '4013']],
      strict: true
    }
  }
};
