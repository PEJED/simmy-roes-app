// Defines flow requirements for each direction

export type Direction = 'Electronics' | 'Informatics' | 'Communications' | 'Energy';
export type FlowSelection = 'none' | 'half' | 'full';

export interface DirectionRules {
  requiredFlows: string[]; // e.g. ['Y', 'L'] for Informatics
  requiredHalfFlows: number; // e.g. 1 means "at least 1 other flow must be half or full"
  name: string;
}

export const DIRECTION_RULES: Record<Direction, DirectionRules> = {
  Electronics: {
    name: 'Ηλεκτρονικής',
    requiredFlows: ['H', 'Y'], // Example: Electronics & Computers
    requiredHalfFlows: 1, // Assume 1 other flow
  },
  Informatics: {
    name: 'Πληροφορικής',
    requiredFlows: ['Y', 'L'], // Computers & Software
    requiredHalfFlows: 1, // + 1/2 other
  },
  Communications: {
    name: 'Επικοινωνιών',
    requiredFlows: ['T', 'D'], // Telecoms & Networks
    requiredHalfFlows: 1,
  },
  Energy: {
    name: 'Ενέργειας',
    requiredFlows: ['E', 'S'], // Energy & Systems
    requiredHalfFlows: 1,
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
  'O': 'Οικονομία', // Assuming purely illustrative mapping
  'I': 'Ιατρική',
  'M': 'Μαθηματικά',
  'F': 'Φυσική'
};

export function validateDirectionSelection(
  direction: Direction | null,
  flows: Record<string, FlowSelection>
): { isValid: boolean; error: string | null } {
  if (!direction) {
    return { isValid: false, error: 'Παρακαλώ επιλέξτε Κατεύθυνση.' };
  }

  const rules = DIRECTION_RULES[direction];

  // Check required full flows
  const missingFlows = rules.requiredFlows.filter(f => flows[f] !== 'full');

  if (missingFlows.length > 0) {
    const names = missingFlows.map(f => FLOW_NAMES[f] || f).join(', ');
    return {
      isValid: false,
      error: `Η κατεύθυνση ${rules.name} απαιτεί Ολόκληρη Ροή για: ${names}.`
    };
  }

  // Check required half/full other flows
  // "Other" means flows NOT in the required list
  const otherFlowsCount = Object.entries(flows).filter(([flowCode, selection]) => {
    return !rules.requiredFlows.includes(flowCode) && (selection === 'half' || selection === 'full');
  }).length;

  if (otherFlowsCount < rules.requiredHalfFlows) {
    return {
      isValid: false,
      error: `Η κατεύθυνση ${rules.name} απαιτεί τουλάχιστον ${rules.requiredHalfFlows} ακόμα μισή ή ολόκληρη ροή.`
    };
  }

  return { isValid: true, error: null };
}
