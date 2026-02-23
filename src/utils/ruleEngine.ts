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

export const validateSelection = (
    selectedCourses: Course[],
    direction: Direction | null,
    flowSelections: Record<string, FlowSelection>
): string[] => {
    const warnings: string[] = [];
    const selectedIds = new Set(selectedCourses.map(c => String(c.id)));

    // --- 1. Identify Active Flows ---
    const activeFlows = Object.entries(flowSelections)
        .filter(([, selection]) => selection !== 'none')
        .map(([code]) => code);

    // --- 2. Check Flow Requirements (Strict Counts) ---
    activeFlows.forEach(flowCode => {
        const selection = flowSelections[flowCode];
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
                 ...(ruleObj.pool || [])
             ]);
             if (manualCompulsory.size > 0) {
                 isCompulsory = (c) => c.is_flow_compulsory || manualCompulsory.has(String(c.id));
             }
        }

        const compulsoryCount = flowCourses.filter(isCompulsory).length;

        // Check Compulsory Count
        if (compulsoryCount < reqCompulsory) {
            warnings.push(`Ροή ${flowCode} (${isFull ? 'Ολόκληρη' : 'Μισή'}): Απαιτούνται τουλάχιστον ${reqCompulsory} υποχρεωτικά μαθήματα (Επιλέξατε: ${compulsoryCount}).`);
        }

        // Check Total Count
        if (totalCount < reqTotal) {
            warnings.push(`Ροή ${flowCode} (${isFull ? 'Ολόκληρη' : 'Μισή'}): Απαιτούνται τουλάχιστον ${reqTotal} μαθήματα συνολικά (Επιλέξατε: ${totalCount}).`);
        }

        // Check Options from FLOW_RULES (e.g. "One of A or B")
        if (ruleObj && ruleObj.options) {
             ruleObj.options.forEach((optGroup, idx) => {
                const hasOne = optGroup.some(id => selectedIds.has(id));
                if (!hasOne) {
                    warnings.push(`Ροή ${flowCode}: Πρέπει να επιλέξετε ένα από τα μαθήματα της ομάδας επιλογής ${idx + 1}.`);
                }
            });
        }
    });

    // --- 3. Global Limits ---

    // Free Electives: Courses NOT in active flows (plus M and F always)
    // "Max 5 free courses (courses outside the declared flows)"
    const freeElectives = selectedCourses.filter(c => {
        const isFreeFlow = FREE_FLOWS.includes(c.flow_code);
        const isNonActiveFlow = !activeFlows.includes(c.flow_code);
        return isFreeFlow || isNonActiveFlow;
    });

    const freeCount = freeElectives.length;
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
            .filter(c =>
                c.semester === 6 &&
                c.is_flow_compulsory &&
                BASIC_FLOWS.includes(c.flow_code)
            )
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

    return warnings;
};
