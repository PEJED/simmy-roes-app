// Defines flow requirements for each direction

export type Direction = 'Electronics' | 'Informatics' | 'Communications' | 'Energy';
export type FlowSelection = 'none' | 'half' | 'full';

export interface DirectionRules {
  name: string;
  description: string;
}

export const DIRECTION_INFO: Record<Direction, DirectionRules> = {
  Electronics: {
    name: 'Ηλεκτρονικής',
    description: 'Εστιάζει στη σχεδίαση και ανάλυση ηλεκτρονικών κυκλωμάτων, μικροηλεκτρονικής, ενσωματωμένων συστημάτων και αισθητήρων. Συνδυάζει υλικό (hardware) με θεωρία ελέγχου και μετρήσεων.',
  },
  Informatics: {
    name: 'Πληροφορικής',
    description: 'Καλύπτει το πλήρες φάσμα της επιστήμης υπολογιστών, από τη θεωρία αλγορίθμων και τις βάσεις δεδομένων, μέχρι τη μηχανική μάθηση, την τεχνητή νοημοσύνη και την ανάπτυξη λογισμικού.',
  },
  Communications: {
    name: 'Επικοινωνιών',
    description: 'Ασχολείται με τη μετάδοση πληροφορίας, τα ασύρματα και ενσύρματα δίκτυα, τις τηλεπικοινωνιακές ζεύξεις, τις κεραίες και την επεξεργασία σήματος για επικοινωνίες.',
  },
  Energy: {
    name: 'Ενέργειας',
    description: 'Εξειδικεύεται στην παραγωγή, μεταφορά και διανομή ηλεκτρικής ενέργειας, τις ανανεώσιμες πηγές, τα ηλεκτρικά δίκτυα, τους κινητήρες και την υψηλή τάση.',
  },
};

export const FLOW_NAMES: Record<string, string> = {
  'Y': 'Ροή Υ',
  'L': 'Ροή Λ',
  'D': 'Ροή Δ',
  'H': 'Ροή Η',
  'T': 'Ροή Τ',
  'S': 'Ροή Σ',
  'E': 'Ροή Ε',
  'Z': 'Ροή Ζ',
  'O': 'Ροή Ο',
  'I': 'Ροή Ι',
  'M': 'Ροή Μ',
  'F': 'Ροή Φ'
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

export const FLOW_DETAILS: Record<string, string> = {
  'Y': 'Μελέτη αρχιτεκτονικής υπολογιστών, μικροεπεξεργαστών, παράλληλων συστημάτων και ενσωματωμένων συστημάτων.',
  'L': 'Σχεδιασμός, ανάπτυξη και διαχείριση συστημάτων λογισμικού, βάσεις δεδομένων, αλγόριθμοι και ασφάλεια.',
  'D': 'Αρχιτεκτονική δικτύων, πρωτόκολλα επικοινωνίας, κινητά δίκτυα και ασφάλεια δικτύων.',
  'H': 'Αναλογικά και ψηφιακά κυκλώματα, μικροηλεκτρονική, αισθητήρες και συστήματα VLSI.',
  'T': 'Θεωρία πληροφορίας, διαμόρφωση σημάτων, ασύρματες ζεύξεις, δορυφορικές επικοινωνίες και οπτικές ίνες.',
  'S': 'Ρομποτική, αυτόματος έλεγχος, συστήματα αποφάσεων, βελτιστοποίηση και ευφυή συστήματα.',
  'E': 'Παραγωγή, μεταφορά και διανομή ενέργειας, ανανεώσιμες πηγές, ηλεκτρικές μηχανές και ηλεκτρονικά ισχύος.',
  'Z': 'Ψηφιακή επεξεργασία σήματος και εικόνας, μηχανική όραση, αναγνώριση προτύπων και ακουστική.',
  'O': 'Μακροοικονομία, μικροοικονομία, διοίκηση επιχειρήσεων, επιχειρησιακή έρευνα και διαχείριση έργων.',
  'I': 'Ιατρική απεικόνιση, βιοϊατρική οργανολογία, βιοπληροφορική και επεξεργασία βιοσημάτων.',
  'M': 'Προχωρημένα μαθηματικά εργαλεία, αριθμητική ανάλυση και στατιστική.',
  'F': 'Κβαντομηχανική, φυσική ημιαγωγών, οπτικοηλεκτρονική και υλικά.'
};

// Helper: Check if flow is 'full'
const isFull = (flows: Record<string, FlowSelection>, code: string) => flows[code] === 'full';
// Helper: Check if flow is 'half'
const isHalf = (flows: Record<string, FlowSelection>, code: string) => flows[code] === 'half';

// Helper: Check specific condition for "Other" flows (excluding main ones)
// Returns true if the remaining flows match one of the 3 sub-options for "{at least 1/2 other}"
const checkAtLeastHalfOther = (flows: Record<string, FlowSelection>, excludeCodes: string[]) => {
  const otherFlows = Object.entries(flows).filter(([code, selection]) => {
    return !excludeCodes.includes(code) && selection !== 'none';
  });

  const fullCount = otherFlows.filter(([, s]) => s === 'full').length;
  const halfCount = otherFlows.filter(([, s]) => s === 'half').length;

  // Option 1: 1 Full (+ 2 Free - handled in Step 2)
  if (fullCount === 1 && halfCount === 0) return true;

  // Option 2: 1 Half (+ 5 Free - handled in Step 2)
  if (fullCount === 0 && halfCount === 1) return true;

  // Option 3: 2 Half (+ 1 Free - handled in Step 2)
  if (fullCount === 0 && halfCount === 2) return true;

  return false;
};

// Helper: Check specific condition for "Full Other" (exactly 1 Full other)
const checkFullOther = (flows: Record<string, FlowSelection>, excludeCodes: string[], allowedCodes: string[]) => {
  const otherFlows = Object.entries(flows).filter(([code, selection]) => {
    return !excludeCodes.includes(code) && selection !== 'none';
  });

  if (otherFlows.length !== 1) return false;
  const [code, selection] = otherFlows[0];

  return selection === 'full' && allowedCodes.includes(code);
};

export function validateDirectionSelection(
  direction: Direction | null,
  flows: Record<string, FlowSelection>
): { isValid: boolean; error: string | null } {
  if (!direction) {
    return { isValid: false, error: 'Παρακαλώ επιλέξτε Κατεύθυνση.' };
  }

  switch (direction) {
    case 'Electronics':
      // a) Full H + {Full Y OR Full S} + {at least 1/2 other}
      if (isFull(flows, 'H')) {
        if (isFull(flows, 'Y') && !isFull(flows, 'S')) { // H + Y + Others
           if (checkAtLeastHalfOther(flows, ['H', 'Y'])) return { isValid: true, error: null };
        }
        if (isFull(flows, 'S') && !isFull(flows, 'Y')) { // H + S + Others
           if (checkAtLeastHalfOther(flows, ['H', 'S'])) return { isValid: true, error: null };
        }
      }

      // b) Full H + Half S + {Full Y OR Full T OR Full Z}
      if (isFull(flows, 'H') && isHalf(flows, 'S')) {
         if (checkFullOther(flows, ['H', 'S'], ['Y', 'T', 'Z'])) return { isValid: true, error: null };
      }

      // c) Half H + Full S + {Full L OR Full D OR Full E}
      if (isHalf(flows, 'H') && isFull(flows, 'S')) {
         if (checkFullOther(flows, ['H', 'S'], ['L', 'D', 'E'])) return { isValid: true, error: null };
      }

      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Ηλεκτρονικής.' };

    case 'Informatics':
      // a) Full Y + Full L + {at least 1/2 other}
      if (isFull(flows, 'Y') && isFull(flows, 'L')) {
         if (checkAtLeastHalfOther(flows, ['Y', 'L'])) return { isValid: true, error: null };
      }

      // b) Full Y + Half L + {Full D OR Full S}
      if (isFull(flows, 'Y') && isHalf(flows, 'L')) {
         if (checkFullOther(flows, ['Y', 'L'], ['D', 'S'])) return { isValid: true, error: null };
      }

      // c) Half Y + Full L + {Full D OR Full S}
      if (isHalf(flows, 'Y') && isFull(flows, 'L')) {
         if (checkFullOther(flows, ['Y', 'L'], ['D', 'S'])) return { isValid: true, error: null };
      }

      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Πληροφορικής.' };

    case 'Communications':
      // a) Full T + Full D + {at least 1/2 other}
      if (isFull(flows, 'T') && isFull(flows, 'D')) {
         if (checkAtLeastHalfOther(flows, ['T', 'D'])) return { isValid: true, error: null };
      }

      // b) Full T + Half D + {Full H OR Full S}
      if (isFull(flows, 'T') && isHalf(flows, 'D')) {
         if (checkFullOther(flows, ['T', 'D'], ['H', 'S'])) return { isValid: true, error: null };
      }

      // c) Half T + Full D + {Full Y OR Full L OR Full S}
      if (isHalf(flows, 'T') && isFull(flows, 'D')) {
         if (checkFullOther(flows, ['T', 'D'], ['Y', 'L', 'S'])) return { isValid: true, error: null };
      }

      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες των Επικοινωνιών.' };

    case 'Energy':
      // a) Full E + Full Z + {at least 1/2 other}
      if (isFull(flows, 'E') && isFull(flows, 'Z')) {
         if (checkAtLeastHalfOther(flows, ['E', 'Z'])) return { isValid: true, error: null };
      }

      // b) Full E + Half Z + {Full T OR Full D OR Full S}
      if (isFull(flows, 'E') && isHalf(flows, 'Z')) {
         if (checkFullOther(flows, ['E', 'Z'], ['T', 'D', 'S'])) return { isValid: true, error: null };
      }

      // c) Half E + Full Z + {Full Y OR Full H OR Full S}
      if (isHalf(flows, 'E') && isFull(flows, 'Z')) {
         if (checkFullOther(flows, ['E', 'Z'], ['Y', 'H', 'S'])) return { isValid: true, error: null };
      }

      return { isValid: false, error: 'Δεν πληρούνται οι κανόνες της Ενέργειας.' };

    default:
      return { isValid: false, error: 'Άγνωστη Κατεύθυνση.' };
  }
}
