// Defines flow requirements for each direction

export type Direction = 'Electronics' | 'Informatics' | 'Communications' | 'Energy';
export type FlowSelection = 'none' | 'half' | 'full';

export interface DirectionRules {
  name: string;
  description: string;
  // We can't use simple arrays anymore because the logic is complex (OR conditions).
  // We'll rely on the validate function for the logic.
}

export const DIRECTION_INFO: Record<Direction, DirectionRules> = {
  Electronics: {
    name: 'Ηλεκτρονικής',
    description: '(Ολόκληρη Η ΚΑΙ [Ολόκληρη Υ ή Σ] ΚΑΙ [Τουλάχιστον Μισή άλλη]) Ή (Ολόκληρη Η ΚΑΙ Μισή Σ ΚΑΙ [Ολόκληρη Υ ή Τ ή Ζ]) Ή (Μισή Η ΚΑΙ Ολόκληρη Σ ΚΑΙ [Ολόκληρη Λ ή Δ ή Ε]).',
  },
  Informatics: {
    name: 'Πληροφορικής',
    description: '(Ολόκληρη Υ ΚΑΙ Ολόκληρη Λ ΚΑΙ [Τουλάχιστον Μισή άλλη]) Ή (Ολόκληρη Υ ΚΑΙ Μισή Λ ΚΑΙ [Ολόκληρη Δ ή Σ]) Ή (Μισή Υ ΚΑΙ Ολόκληρη Λ ΚΑΙ [Ολόκληρη Δ ή Σ]).',
  },
  Communications: {
    name: 'Επικοινωνιών',
    description: '(Ολόκληρη Τ ΚΑΙ Ολόκληρη Δ ΚΑΙ [Τουλάχιστον Μισή άλλη]) Ή (Ολόκληρη Τ ΚΑΙ Μισή Δ ΚΑΙ [Ολόκληρη Η ή Σ]) Ή (Μισή Τ ΚΑΙ Ολόκληρη Δ ΚΑΙ [Ολόκληρη Υ ή Λ ή Σ]).',
  },
  Energy: {
    name: 'Ενέργειας',
    description: '(Ολόκληρη Ε ΚΑΙ Ολόκληρη Ζ ΚΑΙ [Τουλάχιστον Μισή άλλη]) Ή (Ολόκληρη Ε ΚΑΙ Μισή Ζ ΚΑΙ [Ολόκληρη Τ ή Δ ή Σ]) Ή (Μισή Ε ΚΑΙ Ολόκληρη Ζ ΚΑΙ [Ολόκληρη Υ ή Η ή Σ]).',
  },
};

export const FLOW_NAMES: Record<string, string> = {
  'Y': 'Υπολογιστές',
  'L': 'Λογισμικό',
  'D': 'Δίκτυα',
  'H': 'Ηλεκτρονική',
  'T': 'Τηλεπικοινωνίες',
  'S': 'Συστήματα',
  'E': 'Ενέργεια',
  'Z': 'Σήματα',
  'O': 'Οικονομία',
  'I': 'Ιατρική',
  'M': 'Μαθηματικά',
  'F': 'Φυσική'
};

export const FLOW_DESCRIPTIONS: Record<string, string> = {
  'Y': 'Υπολογιστικά Συστήματα',
  'L': 'Τεχνολογία Λογισμικού',
  'D': 'Δίκτυα Υπολογιστών',
  'H': 'Ηλεκτρονική και Κυκλώματα',
  'T': 'Τηλεπικοινωνιακά Συστήματα',
  'S': 'Συστήματα Αποφάσεων',
  'E': 'Συστήματα Ενέργειας',
  'Z': 'Σήματα και Έλεγχος',
  'O': 'Οικονομία και Διοίκηση',
  'I': 'Βιοϊατρική Τεχνολογία',
  'M': 'Εφαρμοσμένα Μαθηματικά',
  'F': 'Εφαρμοσμένη Φυσική'
};

// Helper: Check if flow is 'full'
const isFull = (flows: Record<string, FlowSelection>, code: string) => flows[code] === 'full';
// Helper: Check if flow is 'half'
const isHalf = (flows: Record<string, FlowSelection>, code: string) => flows[code] === 'half';
// Helper: Check if flow is 'half' or 'full' (at least half)
const isAtLeastHalf = (flows: Record<string, FlowSelection>, code: string) => flows[code] === 'half' || flows[code] === 'full';

// Helper: Check "At least half other flow"
// "Other" means flows NOT in the exclude list.
const hasHalfOther = (flows: Record<string, FlowSelection>, excludeCodes: string[]) => {
  return Object.entries(flows).some(([code, selection]) => {
    return !excludeCodes.includes(code) && (selection === 'half' || selection === 'full');
  });
};

export function validateDirectionSelection(
  direction: Direction | null,
  flows: Record<string, FlowSelection>
): { isValid: boolean; error: string | null } {
  if (!direction) {
    return { isValid: false, error: 'Παρακαλώ επιλέξτε Κατεύθυνση.' };
  }

  // Implementation of specific logical rules
  // Returns true if ANY of the OR conditions are met.

  switch (direction) {
    case 'Electronics':
      // (Full H AND [Full Y OR Full S] AND [Half Other])
      // OR (Full H AND Half S AND [Full Y OR Full T OR Full Z])
      // OR (Half H AND Full S AND [Full L OR Full D OR Full E])

      const el_c1 = isFull(flows, 'H') && (isFull(flows, 'Y') || isFull(flows, 'S')) && hasHalfOther(flows, ['H', 'Y', 'S']);
      const el_c2 = isFull(flows, 'H') && isHalf(flows, 'S') && (isFull(flows, 'Y') || isFull(flows, 'T') || isFull(flows, 'Z'));
      const el_c3 = isHalf(flows, 'H') && isFull(flows, 'S') && (isFull(flows, 'L') || isFull(flows, 'D') || isFull(flows, 'E'));

      if (el_c1 || el_c2 || el_c3) return { isValid: true, error: null };
      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Ηλεκτρονικής. Δείτε τις οδηγίες.' };

    case 'Informatics':
      // (Full Y AND Full L AND [Half Other])
      // OR (Full Y AND Half L AND [Full D OR Full S])
      // OR (Half Y AND Full L AND [Full D OR Full S])

      const in_c1 = isFull(flows, 'Y') && isFull(flows, 'L') && hasHalfOther(flows, ['Y', 'L']);
      const in_c2 = isFull(flows, 'Y') && isHalf(flows, 'L') && (isFull(flows, 'D') || isFull(flows, 'S'));
      const in_c3 = isHalf(flows, 'Y') && isFull(flows, 'L') && (isFull(flows, 'D') || isFull(flows, 'S'));

      if (in_c1 || in_c2 || in_c3) return { isValid: true, error: null };
      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Πληροφορικής. Δείτε τις οδηγίες.' };

    case 'Communications':
      // (Full T AND Full D AND [Half Other])
      // OR (Full T AND Half D AND [Full H OR Full S])
      // OR (Half T AND Full D AND [Full Y OR Full L OR Full S])

      const co_c1 = isFull(flows, 'T') && isFull(flows, 'D') && hasHalfOther(flows, ['T', 'D']);
      const co_c2 = isFull(flows, 'T') && isHalf(flows, 'D') && (isFull(flows, 'H') || isFull(flows, 'S'));
      const co_c3 = isHalf(flows, 'T') && isFull(flows, 'D') && (isFull(flows, 'Y') || isFull(flows, 'L') || isFull(flows, 'S'));

      if (co_c1 || co_c2 || co_c3) return { isValid: true, error: null };
      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες των Επικοινωνιών. Δείτε τις οδηγίες.' };

    case 'Energy':
      // (Full E AND Full Z AND [Half Other])
      // OR (Full E AND Half Z AND [Full T OR Full D OR Full S])
      // OR (Half E AND Full Z AND [Full Y OR Full H OR Full S])

      const en_c1 = isFull(flows, 'E') && isFull(flows, 'Z') && hasHalfOther(flows, ['E', 'Z']);
      const en_c2 = isFull(flows, 'E') && isHalf(flows, 'Z') && (isFull(flows, 'T') || isFull(flows, 'D') || isFull(flows, 'S'));
      const en_c3 = isHalf(flows, 'E') && isFull(flows, 'Z') && (isFull(flows, 'Y') || isFull(flows, 'H') || isFull(flows, 'S'));

      if (en_c1 || en_c2 || en_c3) return { isValid: true, error: null };
      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Ενέργειας. Δείτε τις οδηγίες.' };

    default:
      return { isValid: false, error: 'Άγνωστη Κατεύθυνση.' };
  }
}
