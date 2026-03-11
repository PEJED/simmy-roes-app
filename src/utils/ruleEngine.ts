import type { Course } from '../types/Course';
import type { FlowSelection, Direction } from './flowValidation';
import { FLOW_RULES } from '../data/flowRules';

export { type Direction };

export const DIRECTIONS = {
    electronics: 'Ηλεκτρονικής και Συστημάτων',
    informatics: 'Πληροφορικής',
    communications: 'Επικοινωνιών',
    energy: 'Ενέργειας'
};

// Flow Definitions
const BASIC_FLOWS = ['Y', 'L', 'D', 'H', 'T', 'S', 'E', 'Z'];
const SPECIAL_FLOWS = ['I', 'O'];
const FREE_FLOWS = ['M', 'F'];
const NON_FLOW = 'G';
const HUMANITIES = 'K';

export interface DetailedStats {
    freeCount: number;
    humanitiesCount: number;
    nonFlowCount: number;
    warnings: string[];
    flowStats: Record<string, {
        compulsorySelected: number;
        totalSelected: number;
        requiredTotal: number;
        requiredCompulsory: number;
        isComplete: boolean;
        missingCompulsory: number;
        missingTotal: number;
    }>;
}

export const calculateDetailedStats = (
    selectedCourses: Course[],
    direction: Direction | null,
    flowSelections: Record<string, FlowSelection>
): DetailedStats => {
    const warnings: string[] = [];
    const selectedIds = new Set(selectedCourses.map(c => String(c.id)));
    const totalSelectedCount = selectedCourses.length;

    // Stats per flow
    const flowStats: DetailedStats['flowStats'] = {};

    // --- 0. Total Courses Check ---
    if (totalSelectedCount !== 25) {
         warnings.push(`Απαιτούνται ακριβώς 25 μαθήματα για τη λήψη διπλώματος (Έχετε επιλέξει: ${totalSelectedCount}).`);
    }

    // --- 0b. Course Pool Check: Must pick 1 of {3068, 3450} ---
    const hasThevrikaDiktia = selectedIds.has('3068');
    const hasMihanikhMathish = selectedIds.has('3450');
    if (!hasThevrikaDiktia && !hasMihanikhMathish) {
        warnings.push('Υποχρεωτική Επιλογή: Πρέπει να επιλέξετε ένα από τα μαθήματα: «Θεωρία Δικτύων και Κυκλωμάτων» ή «Μηχανική Μάθηση».');
    }

    // --- 1. Identify Active Flows ---
    const activeFlows = Object.entries(flowSelections)
        .filter(([, selection]) => selection !== 'none')
        .map(([code]) => code);

    // --- 2. Check Flow Requirements (Strict Counts) ---
    activeFlows.forEach(flowCode => {
        const selection = flowSelections[flowCode];
        if (selection === 'none') return;

        const isFull = selection === 'full';
        const isHalf = selection === 'half';

        // Get courses for this flow
        const flowCourses = selectedCourses.filter(c => c.flow_code === flowCode);
        const totalCount = flowCourses.length;

        // Requirements
        let reqTotal = 0;
        let reqCompulsory = 0;

        if (isFull) {
            reqTotal = 7;
            reqCompulsory = 4;
        } else if (isHalf) {
            reqTotal = 4;
            reqCompulsory = 3;
        }

        // Special Flows (I, O) are always Full if selected
        if (SPECIAL_FLOWS.includes(flowCode)) {
            if (isHalf) {
                warnings.push(`Ροή ${flowCode}: Οι ειδικές ροές επιλέγονται μόνο ως Ολόκληρες.`);
            }
            reqTotal = 7;
            reqCompulsory = 4;
        }

        // Determine Compulsory Count
        // A course counts as compulsory if marked in data OR listed in FLOW_RULES (compulsory list or pool)
        let isCompulsory = (c: Course) => c.is_flow_compulsory;

        const rule = FLOW_RULES[flowCode]?.[selection];
        const ruleObj = typeof rule === 'function' ? rule(direction) : rule;

        if (ruleObj) {
             const manualCompulsory = new Set([
                 ...(ruleObj.compulsory || []),
                 ...(ruleObj.pool || []),
                 ...(ruleObj.options ? ruleObj.options.flat() : [])
             ]);
             if (manualCompulsory.size > 0) {
                 isCompulsory = (c) => c.is_flow_compulsory || manualCompulsory.has(String(c.id));
             }
        }

        const compulsoryCount = flowCourses.filter(isCompulsory).length;

        // Store Stats
        let isComplete = true;

        // Check Compulsory Count
        if (compulsoryCount < reqCompulsory) {
            warnings.push(`Ροή ${flowCode} (${isFull ? 'Ολόκληρη' : 'Μισή'}): Απαιτούνται τουλάχιστον ${reqCompulsory} υποχρεωτικά μαθήματα (Επιλέξατε: ${compulsoryCount}).`);
            isComplete = false;
        }

        // Check Total Count (Only warn if LESS than required, no warning for MORE since they become free electives)
        if (totalCount < reqTotal) {
             const typeStr = isFull ? 'Ολόκληρη' : 'Μισή';
             warnings.push(`Ροή ${flowCode} (${typeStr}): Απαιτούνται τουλάχιστον ${reqTotal} μαθήματα (Επιλέξατε: ${totalCount}).`);
             isComplete = false;
        }

        // Check Options from FLOW_RULES (e.g. "One of A or B")
        if (ruleObj && ruleObj.options) {
             ruleObj.options.forEach((optGroup: string[], idx: number) => {
                const hasOne = optGroup.some((id: string) => selectedIds.has(id));
                if (!hasOne) {
                    warnings.push(`Ροή ${flowCode}: Πρέπει να επιλέξετε ένα από τα μαθήματα της ομάδας επιλογής ${idx + 1}.`);
                    isComplete = false;
                }
            });
        }

        flowStats[flowCode] = {
            compulsorySelected: compulsoryCount,
            totalSelected: totalCount,
            requiredTotal: reqTotal,
            requiredCompulsory: reqCompulsory,
            isComplete,
            missingCompulsory: Math.max(0, reqCompulsory - compulsoryCount),
            missingTotal: Math.max(0, reqTotal - totalCount)
        };
    });

    // --- 3. Global Limits ---

    const freeElectives = selectedCourses.filter(c => {
        if (c.flow_code === 'P') return false; // Κορμός courses are never *automatically* free electives
        if (c.flow_code === HUMANITIES || c.type === 'humanities') return false; // Tracked separately
        if (c.flow_code === NON_FLOW) return false; // Tracked separately
        
        const isFreeFlow = FREE_FLOWS.includes(c.flow_code);
        const isNonActiveFlow = !activeFlows.includes(c.flow_code);
        return isFreeFlow || isNonActiveFlow;
    });

    let extraFlowCoursesCount = 0;
    Object.values(flowStats).forEach(stat => {
         if (stat.totalSelected > stat.requiredTotal) {
             extraFlowCoursesCount += (stat.totalSelected - stat.requiredTotal);
         }
    });

    // P courses (Core) extra calculation
    // Max required core courses is 2 (3035 + 1 from {3068, 3450})
    const pCoursesCount = selectedCourses.filter(c => c.flow_code === 'P').length;
    if (pCoursesCount > 2) {
        extraFlowCoursesCount += (pCoursesCount - 2);
    }

    const freeCount = freeElectives.length + extraFlowCoursesCount;
    if (freeCount > 5) {
        warnings.push(`Έχετε επιλέξει ${freeCount} ελεύθερα μαθήματα (Μέγιστο: 5).`);
    }

    // Humanities Limit (K or type 'humanities')
    const humanitiesCount = selectedCourses.filter(c => c.flow_code === HUMANITIES || c.type === 'humanities').length;
    if (humanitiesCount > 1) {
        warnings.push(`Έχετε επιλέξει ${humanitiesCount} ανθρωπιστικά μαθήματα (Μέγιστο: 1).`);
    }

    // Non-Flow Limit (G)
    const nonFlowCount = selectedCourses.filter(c => c.flow_code === NON_FLOW).length;
    if (nonFlowCount > 1) {
        warnings.push(`Έχετε επιλέξει ${nonFlowCount} μαθήματα εκτός ροών (Μέγιστο: 1).`);
    }

    // --- 4. 6th Semester Rule ---
    // "Must select at least 1 compulsory course of the 6th semester from 3 different BASIC flows."
    const flowsWithComp6th = new Set(
        selectedCourses
            .filter(c => {
                if (c.semester !== 6 || !BASIC_FLOWS.includes(c.flow_code)) return false;

                // Check dynamically if it's considered compulsory in any flow selection rule
                let isCompulsoryDynamic = c.is_flow_compulsory;
                const flowSel = flowSelections[c.flow_code];
                if (flowSel && flowSel !== 'none') {
                    let rule = FLOW_RULES[c.flow_code]?.[flowSel];
                    const ruleObj = typeof rule === 'function' ? rule(direction) : rule;

                    if (ruleObj) {
                        const manualCompulsory = new Set([
                            ...(ruleObj.compulsory || []),
                            ...(ruleObj.pool || []),
                            ...(ruleObj.options ? ruleObj.options.flat() : [])
                        ]);
                        if (manualCompulsory.has(String(c.id))) {
                            isCompulsoryDynamic = true;
                        }
                    }
                }
                return isCompulsoryDynamic;
            })
            .map(c => c.flow_code)
    );

    if (flowsWithComp6th.size < 3) {
        warnings.push(`Κανόνας 6ου Εξαμήνου: Επιλογή 1 υποχρεωτικού από 3 διαφορετικές βασικές ροές (Τρέχουσες: ${flowsWithComp6th.size}).`);
    }

    // --- 5. Semester Limits ---
    // Check for > 7 courses per semester (implicit rule often present, kept from old code)
    const semCounts = {6:0, 7:0, 8:0, 9:0};
    selectedCourses.forEach(c => {
        if (semCounts[c.semester as keyof typeof semCounts] !== undefined) {
            semCounts[c.semester as keyof typeof semCounts]++;
        }
    });

    [6, 7, 8, 9].forEach(sem => {
        if (semCounts[sem as keyof typeof semCounts] > 7) {
            warnings.push(`Υπέρβαση ορίου μαθημάτων στο ${sem}ο εξάμηνο (>7).`);
        }
    });

    return {
        warnings,
        freeCount,
        humanitiesCount,
        nonFlowCount,
        flowStats
    };
};

export const validateSelection = (
    selectedCourses: Course[],
    direction: Direction | null,
    flowSelections: Record<string, FlowSelection>
): string[] => {
    return calculateDetailedStats(selectedCourses, direction, flowSelections).warnings;
};
