import type { Course } from '../types/Course';

export type Direction = 'electronics' | 'informatics' | 'communications' | 'energy';

export const DIRECTIONS = {
    electronics: 'Ηλεκτρονικής και Συστημάτων',
    informatics: 'Πληροφορικής',
    communications: 'Επικοινωνιών',
    energy: 'Ενέργειας'
};

export const validateSelection = (selectedCourses: Course[], selectedDirection: Direction | null): string[] => {
    const warnings: string[] = [];

    // Rule 1: Max 5 free courses
    const freeCourses = selectedCourses.filter(c => c.type === 'free').length;
    if (freeCourses > 5) {
        warnings.push(`Έχετε επιλέξει ${freeCourses} ελεύθερα μαθήματα (Μέγιστο: 5).`);
    }

    // Rule 2: Max 1 humanities course
    const humanitiesCourses = selectedCourses.filter(c => c.type === 'humanities').length;
    if (humanitiesCourses > 1) {
        warnings.push(`Έχετε επιλέξει ${humanitiesCourses} ανθρωπιστικά μαθήματα (Μέγιστο: 1).`);
    }

    // Rule 3: Max 1 course not in flows (assuming 'X' flow_code is "not in flow" if type isn't free/humanities/project/thesis)
    const notInFlows = selectedCourses.filter(c => c.flow_code === 'X' && !['free', 'humanities', 'project', 'thesis'].includes(c.type)).length;
    if (notInFlows > 1) {
        warnings.push(`Έχετε επιλέξει ${notInFlows} μαθήματα εκτός ροών (Μέγιστο: 1).`);
    }

    // Rule 4: At least 1 compulsory course from 6th semester from 3 different flows
    const distinctFlows6th = new Set(
        selectedCourses
            .filter(c => c.semester === 6 && c.type === 'compulsory' && ['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E'].includes(c.flow_code))
            .map(c => c.flow_code)
    );
    if (distinctFlows6th.size < 3) {
        warnings.push(`Πρέπει να επιλέξετε τουλάχιστον 1 υποχρεωτικό μάθημα 6ου εξαμήνου από 3 διαφορετικές ροές. (Τρέχουσες: ${distinctFlows6th.size})`);
    }

    // Direction Logic
    if (selectedDirection) {
        const flowCounts = countFlows(selectedCourses);
        const directionWarning = checkDirectionRules(selectedDirection, flowCounts);
        if (directionWarning) {
            warnings.push(directionWarning);
        }
    }

    return warnings;
};

// Let's count courses per flow code.
const countFlows = (courses: Course[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    courses.forEach(c => {
        if (['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E', 'O', 'I'].includes(c.flow_code)) {
            counts[c.flow_code] = (counts[c.flow_code] || 0) + 1;
        }
    });
    return counts;
};

// Mock thresholds
const FULL_FLOW_THRESHOLD = 4;
const HALF_FLOW_THRESHOLD = 2;

const getFlowStatus = (count: number) => {
    if (count >= FULL_FLOW_THRESHOLD) return 1.0;
    if (count >= HALF_FLOW_THRESHOLD) return 0.5;
    return 0;
};

// Helper to check for "at least 1/2 other flow"
const hasHalfOtherFlow = (counts: Record<string, number>, excludeFlows: string[]) => {
    // Check if any flow NOT in excludeFlows has status >= 0.5
    const otherFlows = Object.keys(counts).filter(f => !excludeFlows.includes(f));
    for (const flow of otherFlows) {
        if (getFlowStatus(counts[flow]) >= 0.5) return true;
    }
    return false;
};

const checkDirectionRules = (
    direction: Direction,
    counts: Record<string, number>
): string | null => {

    let satisfied = false;
    let missing = "";

    // Logic for "at least 1/2 other flow" check
    // We pass the flows used in the primary condition to exclude them from the "other" check.

    switch (direction) {
        case 'informatics': // Πληροφορική
            const Y = getFlowStatus(counts['Y'] || 0);
            const L = getFlowStatus(counts['L'] || 0);
            const D = getFlowStatus(counts['D'] || 0);
            const S = getFlowStatus(counts['S'] || 0);

            // a) {Y, L} + {at least 1/2 other}
            if (Y === 1 && L === 1) {
                if (hasHalfOtherFlow(counts, ['Y', 'L'])) satisfied = true;
                else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) {Y, ½L } + {D or S}
            else if (Y === 1 && L >= 0.5 && (D === 1 || S === 1)) satisfied = true;
            // c) { ½Y, L } + {D or S}
            else if (Y >= 0.5 && L === 1 && (D === 1 || S === 1)) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Υ + Λ + ½ άλλη) ή (Υ + ½Λ + Δ/Σ) ή (½Υ + Λ + Δ/Σ)";
            break;

        case 'electronics': // Ηλεκτρονική
            const H = getFlowStatus(counts['H'] || 0);
            const S_el = getFlowStatus(counts['S'] || 0);
            const Y_el = getFlowStatus(counts['Y'] || 0);
            const T_el = getFlowStatus(counts['T'] || 0);
            const Z_el = getFlowStatus(counts['Z'] || 0);
            const L_el = getFlowStatus(counts['L'] || 0);
            const D_el = getFlowStatus(counts['D'] || 0);
            const E_el = getFlowStatus(counts['E'] || 0);

            // a) {H} + {Y or S} + {at least 1/2 other}
            if (H === 1 && (Y_el === 1 || S_el === 1)) {
                 // Identify used flows
                 const used = ['H', Y_el === 1 ? 'Y' : 'S'];
                 if (hasHalfOtherFlow(counts, used)) satisfied = true;
                 else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) {H, ½S} + {Y or T or Z}
            else if (H === 1 && S_el >= 0.5 && (Y_el === 1 || T_el === 1 || Z_el === 1)) satisfied = true;
            // c) { ½H, S} + {L or D or E}
            else if (H >= 0.5 && S_el === 1 && (L_el === 1 || D_el === 1 || E_el === 1)) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Η + Υ/Σ + ½ άλλη) ή (Η + ½Σ + Υ/Τ/Ζ) ή (½Η + Σ + Λ/Δ/Ε)";
            break;

        case 'communications': // Επικοινωνιών
            const T = getFlowStatus(counts['T'] || 0);
            const D_com = getFlowStatus(counts['D'] || 0);
            const H_com = getFlowStatus(counts['H'] || 0);
            const S_com = getFlowStatus(counts['S'] || 0);
            const Y_com = getFlowStatus(counts['Y'] || 0);
            const L_com = getFlowStatus(counts['L'] || 0);

            // a) {T, D} + {at least 1/2 other}
            if (T === 1 && D_com === 1) {
                if (hasHalfOtherFlow(counts, ['T', 'D'])) satisfied = true;
                else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
            }
            // b) {T, ½D} + { H or S}
            else if (T === 1 && D_com >= 0.5 && (H_com === 1 || S_com === 1)) satisfied = true;
            // c) { ½T, D} + { Y or L or S}
            else if (T >= 0.5 && D_com === 1 && (Y_com === 1 || L_com === 1 || S_com === 1)) satisfied = true;

            if (!satisfied && !missing) missing = "Απαιτείται: (Τ + Δ + ½ άλλη) ή (Τ + ½Δ + Η/Σ) ή (½Τ + Δ + Υ/Λ/Σ)";
            break;

        case 'energy': // Ενέργειας
             const E = getFlowStatus(counts['E'] || 0);
             const Z = getFlowStatus(counts['Z'] || 0);
             const T_en = getFlowStatus(counts['T'] || 0);
             const D_en = getFlowStatus(counts['D'] || 0);
             const S_en = getFlowStatus(counts['S'] || 0);
             const Y_en = getFlowStatus(counts['Y'] || 0);
             const H_en = getFlowStatus(counts['H'] || 0);

             // a) {E, Z} + {at least 1/2 other}
             if (E === 1 && Z === 1) {
                 if (hasHalfOtherFlow(counts, ['E', 'Z'])) satisfied = true;
                 else missing = "Απαιτείται επιπλέον τουλάχιστον ½ άλλη ροή.";
             }
             // b) {E, ½Z} + {T or D or S}
             else if (E === 1 && Z >= 0.5 && (T_en === 1 || D_en === 1 || S_en === 1)) satisfied = true;
             // c) { ½E, Z} + {Y or H or S}
             else if (E >= 0.5 && Z === 1 && (Y_en === 1 || H_en === 1 || S_en === 1)) satisfied = true;

             if (!satisfied && !missing) missing = "Απαιτείται: (Ε + Ζ + ½ άλλη) ή (Ε + ½Ζ + Τ/Δ/Σ) ή (½Ε + Ζ + Υ/Η/Σ)";
             break;
    }

    if (!satisfied) {
        return `Δεν πληρούνται οι προϋποθέσεις της κατεύθυνσης ${DIRECTIONS[direction]}. ${missing}`;
    }

    return null;
};
