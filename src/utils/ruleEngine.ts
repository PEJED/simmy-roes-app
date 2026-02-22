import type { Course } from '../types/Course';
import type { FlowSelection } from './flowValidation';

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

interface FlowBucket {
    compulsory: number;
    elective: number;
    overflow: number;
}

export const validateSelection = (
    selectedCourses: Course[],
    flowSelections: Record<string, FlowSelection>
): string[] => {
    const warnings: string[] = [];

    // Buckets for flow counting
    const flowBuckets: Record<string, FlowBucket> = {};
    let freeCount = 0;
    let humanitiesCount = 0;
    let nonFlowCount = 0;

    // Initialize buckets for selected flows
    Object.keys(flowSelections).forEach(flowCode => {
        flowBuckets[flowCode] = { compulsory: 0, elective: 0, overflow: 0 };
    });

    // Helper to get targets
    const getTargets = (flowCode: string) => {
        const selection = flowSelections[flowCode];
        if (selection === 'full') return { total: FULL_FLOW_TOTAL, comp: FULL_FLOW_COMPULSORY };
        if (selection === 'half') return { total: HALF_FLOW_TOTAL, comp: HALF_FLOW_COMPULSORY };
        return { total: 0, comp: 0 }; // Should not happen if initialized
    };

    // Process courses
    // Sort to prioritize compulsory courses filling the requirements first
    const sortedCourses = [...selectedCourses].sort((a, b) => {
        if (a.is_flow_compulsory && !b.is_flow_compulsory) return -1;
        if (!a.is_flow_compulsory && b.is_flow_compulsory) return 1;
        return 0;
    });

    sortedCourses.forEach(c => {
        const flowCode = c.flow_code;

        // Check if course belongs to a selected flow
        if (flowSelections[flowCode]) {
            const bucket = flowBuckets[flowCode];
            const targets = getTargets(flowCode);
            const currentTotal = bucket.compulsory + bucket.elective;

            if (c.is_flow_compulsory) {
                // Try to fill compulsory slot
                if (bucket.compulsory < targets.comp) {
                    bucket.compulsory++;
                }
                // Else try to fill elective slot (compulsory acting as elective)
                else if (currentTotal < targets.total) {
                    bucket.elective++;
                }
                // Else overflow
                else {
                    bucket.overflow++;
                }
            } else {
                // Elective
                if (currentTotal < targets.total) {
                    bucket.elective++;
                } else {
                    bucket.overflow++;
                }
            }
        } else {
            // Course not in a selected flow
            if (flowCode === 'K' || c.type === 'humanities') {
                humanitiesCount++;
            } else if (flowCode === 'G') {
                nonFlowCount++;
            } else {
                // M, F, or other flows not selected -> Free Elective
                freeCount++;
            }
        }
    });

    // Add overflows to free count
    Object.values(flowBuckets).forEach(b => {
        freeCount += b.overflow;
    });

    // Rule 1: Max 5 free courses
    if (freeCount > 5) {
        warnings.push(`Έχετε επιλέξει ${freeCount} ελεύθερα μαθήματα (Μέγιστο: 5).`);
    }

    // Rule 2: Max 1 humanities course
    if (humanitiesCount > 1) {
        warnings.push(`Έχετε επιλέξει ${humanitiesCount} ανθρωπιστικά μαθήματα (Μέγιστο: 1).`);
    }

    // Rule 3: Max 1 non-flow course
    if (nonFlowCount > 1) {
        warnings.push(`Έχετε επιλέξει ${nonFlowCount} μαθήματα εκτός ροών (Μέγιστο: 1).`);
    }

    // Check Flow Requirements (Undercount)
    Object.entries(flowBuckets).forEach(([flowCode, bucket]) => {
        const targets = getTargets(flowCode);
        const total = bucket.compulsory + bucket.elective;

        if (bucket.compulsory < targets.comp) {
            warnings.push(`Ροή ${flowCode}: Απαιτούνται ${targets.comp} υποχρεωτικά μαθήματα (Επιλεγμένα: ${bucket.compulsory}).`);
        }
        if (total < targets.total) {
            warnings.push(`Ροή ${flowCode}: Απαιτούνται συνολικά ${targets.total} μαθήματα (Επιλεγμένα: ${total}).`);
        }
    });

    // Rule 4: At least 1 compulsory course from 6th semester from 3 different CORE flows
    const distinctFlows6th = new Set(
        selectedCourses
            .filter(c => c.semester === 6 && c.is_flow_compulsory && ['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E'].includes(c.flow_code))
            .map(c => c.flow_code)
    );
    if (distinctFlows6th.size < 3) {
        warnings.push(`Πρέπει να επιλέξετε τουλάχιστον 1 υποχρεωτικό μάθημα 6ου εξαμήνου από 3 διαφορετικές βασικές ροές (Υ, Λ, Η, Δ, Τ, Σ, Ζ, Ε). (Τρέχουσες: ${distinctFlows6th.size})`);
    }

    return warnings;
};
