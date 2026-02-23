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

export const validateSelection = (
    selectedCourses: Course[],
    direction: Direction | null,
    flowSelections: Record<string, FlowSelection>
): string[] => {
    const warnings: string[] = [];
    const selectedIds = selectedCourses.map(c => String(c.id));

    // 1. General Limits
    const strictFree = selectedCourses.filter(c => c.type === 'free' || ['M', 'F'].includes(c.flow_code)).length;
    const humanitiesCount = selectedCourses.filter(c => c.type === 'humanities' || c.flow_code === 'K').length;
    const nonFlowCount = selectedCourses.filter(c => c.flow_code === 'G').length;

    if (strictFree > 5) warnings.push(`Έχετε επιλέξει ${strictFree} ελεύθερα μαθήματα (Μέγιστο: 5).`);
    if (humanitiesCount > 1) warnings.push(`Έχετε επιλέξει ${humanitiesCount} ανθρωπιστικά μαθήματα (Μέγιστο: 1).`);
    if (nonFlowCount > 1) warnings.push(`Έχετε επιλέξει ${nonFlowCount} μαθήματα εκτός ροών (Μέγιστο: 1).`);

    // 2. Semester Limits (>7)
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

    // 3. Flow Specific Rules
    Object.entries(flowSelections).forEach(([flowCode, selection]) => {
        if (selection === 'none') return;

        let rule = FLOW_RULES[flowCode]?.[selection];
        if (typeof rule === 'function') {
            rule = rule(direction);
        }

        if (!rule) return;

        // Check compulsory list
        if (rule.compulsory) {
            const missing = rule.compulsory.filter(id => !selectedIds.includes(id));
            if (missing.length > 0) {
                warnings.push(`Ροή ${flowCode} (${selection === 'full' ? 'Ολόκληρη' : 'Μισή'}): Λείπουν ${missing.length} υποχρεωτικά μαθήματα.`);
            }
        }

        // Check required count from pool
        if (rule.pool && rule.required_count) {
            const selectedFromPool = rule.pool.filter(id => selectedIds.includes(id)).length;
            if (selectedFromPool < rule.required_count) {
                warnings.push(`Ροή ${flowCode}: Πρέπει να επιλέξετε τουλάχιστον ${rule.required_count} από τη λίστα υποχρεωτικών (Επιλέξατε: ${selectedFromPool}).`);
            }
        }

        // Check options (OR logic)
        if (rule.options) {
            rule.options.forEach((optGroup, idx) => {
                const hasOne = optGroup.some(id => selectedIds.includes(id));
                if (!hasOne) {
                    warnings.push(`Ροή ${flowCode}: Πρέπει να επιλέξετε ένα από τα μαθήματα της ομάδας επιλογής ${idx + 1}.`);
                }
            });
        }
    });

    // 4. 6th Semester Rule (1 compulsory from 3 flows)
    const coreFlows = ['Y', 'L', 'H', 'D', 'T', 'S', 'Z', 'E'];
    const flowsWithComp6th = new Set(
        selectedCourses
            .filter(c => c.semester === 6 && c.is_flow_compulsory && coreFlows.includes(c.flow_code))
            .map(c => c.flow_code)
    );

    if (flowsWithComp6th.size < 3) {
        warnings.push(`Κανόνας 6ου Εξαμήνου: Επιλογή 1 υποχρεωτικού από 3 διαφορετικές βασικές ροές (Τρέχουσες: ${flowsWithComp6th.size}).`);
    }

    return warnings;
};
