import type { Course } from '../types/Course';

export type Direction = 'electronics' | 'informatics' | 'communications' | 'energy';

export const DIRECTIONS = {
    electronics: 'Ηλεκτρονικής και Συστημάτων',
    informatics: 'Πληροφορικής',
    communications: 'Επικοινωνιών',
    energy: 'Ενέργειας'
};

const FULL_FLOW_TOTAL = 7;
const FULL_FLOW_COMPULSORY = 4;
const HALF_FLOW_TOTAL = 4;
const HALF_FLOW_COMPULSORY = 3;

interface FlowStats {
    total: number;
    compulsory: number;
}

export const validateSelection = (selectedCourses: Course[], selectedDirection: Direction | null): string[] => {
    const warnings: string[] = [];

    // Rule 1: Max 5 free courses
    // M and F flow courses are strictly free electives.
    const freeCourses = selectedCourses.filter(c =>
        c.type === 'free' || c.flow_code === 'M' || c.flow_code === 'F'
    ).length;

    if (freeCourses > 5) {
        warnings.push(`Έχετε επιλέξει ${freeCourses} ελεύθερα μαθήματα (Μέγιστο: 5).`);
    }

    // Rule 2: Max 1 humanities course
    const humanitiesCourses = selectedCourses.filter(c => c.type === 'humanities').length;
    if (humanitiesCourses > 1) {
        warnings.push(`Έχετε επιλέξει ${humanitiesCourses} ανθρωπιστικά μαθήματα (Μέγιστο: 1).`);
    }

    // Rule 3: Max 1 course not in flows (using 'G' for "Non-flow")
    // Assuming 'G' is the code for "Μη εντασσόμενα σε ροές"
    const nonFlowCourses = selectedCourses.filter(c => c.flow_code === 'G').length;
    if (nonFlowCourses > 1) {
        warnings.push(`Έχετε επιλέξει ${nonFlowCourses} μαθήματα εκτός ροών (Μέγιστο: 1).`);
    }

    // Rule 4: At least 1 compulsory course from 6th semester from 3 different CORE flows
    const distinctFlows6th = new Set(
        selectedCourses
            .filter(c => c.semester === 6 && c.is_flow_compulsory && ['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E'].includes(c.flow_code))
            .map(c => c.flow_code)
    );
    if (distinctFlows6th.size < 3) {
        warnings.push(`Πρέπει να επιλέξετε τουλάχιστον 1 υποχρεωτικό μάθημα 6ου εξαμήνου από 3 διαφορετικές βασικές ροές. (Τρέχουσες: ${distinctFlows6th.size})`);
    }

    // Direction Logic
    if (selectedDirection) {
        const flowStats = countFlows(selectedCourses);
        const directionWarning = checkDirectionRules(selectedDirection, flowStats);
        if (directionWarning) {
            warnings.push(directionWarning);
        }
    }

    return warnings;
};

// Count courses per flow code (total and compulsory)
const countFlows = (courses: Course[]): Record<string, FlowStats> => {
    const stats: Record<string, FlowStats> = {};

    // Initialize for all main flows to avoid undefined checks later
    ['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E', 'O', 'I'].forEach(code => {
        stats[code] = { total: 0, compulsory: 0 };
    });

    courses.forEach(c => {
        if (['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E', 'O', 'I'].includes(c.flow_code)) {
            stats[c.flow_code].total += 1;
            if (c.is_flow_compulsory) {
                stats[c.flow_code].compulsory += 1;
            }
        }
    });
    return stats;
};

const getFlowStatus = (stats: FlowStats): number => {
    if (stats.total >= FULL_FLOW_TOTAL && stats.compulsory >= FULL_FLOW_COMPULSORY) return 1.0;
    if (stats.total >= HALF_FLOW_TOTAL && stats.compulsory >= HALF_FLOW_COMPULSORY) return 0.5;
    return 0;
};

// Helper to check for "at least 1/2 other flow"
const checkAtLeastHalfOther = (stats: Record<string, FlowStats>, excludeFlows: string[]): boolean => {
    const otherFlows = Object.keys(stats).filter(f => !excludeFlows.includes(f));

    for (const flow of otherFlows) {
        if (getFlowStatus(stats[flow]) >= 0.5) return true;
    }
    return false;
};

const checkDirectionRules = (
    direction: Direction,
    stats: Record<string, FlowStats>
): string | null => {

    let satisfied = false;
    let missing = "";

    // Helper to check "Full" and "Half" status by code
    const isFull = (code: string) => getFlowStatus(stats[code] || { total: 0, compulsory: 0 }) === 1.0;
    const isHalf = (code: string) => getFlowStatus(stats[code] || { total: 0, compulsory: 0 }) >= 0.5;

    switch (direction) {
        case 'informatics': // Πληροφορική
            // a) Full Y + Full L + {at least 1/2 other}
            if (isFull('Y') && isFull('L')) {
                if (checkAtLeastHalfOther(stats, ['Y', 'L'])) satisfied = true;
                else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) Full Y + Half L + {Full D or S}
            else if (isFull('Y') && isHalf('L') && (isFull('D') || isFull('S'))) satisfied = true;
            // c) Half Y + Full L + {Full D or S}
            else if (isHalf('Y') && isFull('L') && (isFull('D') || isFull('S'))) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Υ + Λ + ½ άλλη) ή (Υ + ½Λ + Δ/Σ) ή (½Υ + Λ + Δ/Σ)";
            break;

        case 'electronics': // Ηλεκτρονική
            // a) Full H + {Full Y or S} + {at least 1/2 other}
            if (isFull('H') && (isFull('Y') || isFull('S'))) {
                 const used = ['H', isFull('Y') ? 'Y' : 'S'];
                 if (checkAtLeastHalfOther(stats, used)) satisfied = true;
                 else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) Full H + Half S + {Full Y or T or Z}
            else if (isFull('H') && isHalf('S') && (isFull('Y') || isFull('T') || isFull('Z'))) satisfied = true;
            // c) Half H + Full S + {Full L or D or E}
            else if (isHalf('H') && isFull('S') && (isFull('L') || isFull('D') || isFull('E'))) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Η + Υ/Σ + ½ άλλη) ή (Η + ½Σ + Υ/Τ/Ζ) ή (½Η + Σ + Λ/Δ/Ε)";
            break;

        case 'communications': // Επικοινωνιών
            // a) Full T + Full D + {at least 1/2 other}
            if (isFull('T') && isFull('D')) {
                if (checkAtLeastHalfOther(stats, ['T', 'D'])) satisfied = true;
                else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) Full T + Half D + {Full H or S}
            else if (isFull('T') && isHalf('D') && (isFull('H') || isFull('S'))) satisfied = true;
            // c) Half T + Full D + {Full Y or L or S}
            else if (isHalf('T') && isFull('D') && (isFull('Y') || isFull('L') || isFull('S'))) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Τ + Δ + ½ άλλη) ή (Τ + ½Δ + Η/Σ) ή (½Τ + Δ + Υ/Λ/Σ)";
            break;

        case 'energy': // Ενέργειας
             // a) Full E + Full Z + {at least 1/2 other}
             if (isFull('E') && isFull('Z')) {
                 if (checkAtLeastHalfOther(stats, ['E', 'Z'])) satisfied = true;
                 else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
             }
             // b) Full E + Half Z + {Full T or D or S}
             else if (isFull('E') && isHalf('Z') && (isFull('T') || isFull('D') || isFull('S'))) satisfied = true;
             // c) Half E + Full Z + {Full Y or H or S}
             else if (isHalf('E') && isFull('Z') && (isFull('Y') || isFull('H') || isFull('S'))) satisfied = true;

             if (!satisfied && !missing) missing = "Απαιτείται: (Ε + Ζ + ½ άλλη) ή (Ε + ½Ζ + Τ/Δ/Σ) ή (½Ε + Ζ + Υ/Η/Σ)";
             break;
    }

    if (!satisfied) {
        return `Δεν πληρούνται οι προϋποθέσεις της κατεύθυνσης ${DIRECTIONS[direction]}. ${missing}`;
    }

    return null;
};
