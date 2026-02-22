import type { Direction, FlowSelection } from './flowValidation';
import { FLOW_RULES } from '../data/flowRules';

export interface RuleStatus {
  ruleId: string;
  description: string;
  isMet: boolean;
  involvedCourseIds: string[];
  currentCount: number;
  targetCount: number;
  isStrict: boolean;
  type: 'compulsory' | 'pool' | 'options';
  flowCode: string;
}

export const evaluateRules = (
  selectedIds: string[],
  flowSelections: Record<string, FlowSelection>,
  direction: Direction | null
): RuleStatus[] => {
  const statuses: RuleStatus[] = [];

  Object.entries(flowSelections).forEach(([flowCode, selection]) => {
    if (selection === 'none') return;

    let rule = FLOW_RULES[flowCode]?.[selection];
    if (typeof rule === 'function') {
      rule = rule(direction);
    }

    if (!rule) return;

    // 1. Fixed Compulsory List
    if (rule.compulsory && rule.compulsory.length > 0) {
      const selectedCount = rule.compulsory.filter(id => selectedIds.includes(id)).length;
      const target = rule.compulsory.length;
      const isMet = selectedCount === target; // "All of"

      statuses.push({
        ruleId: `${flowCode}-${selection}-compulsory`,
        description: rule.description || `Υποχρεωτικά ${flowCode}`,
        isMet,
        involvedCourseIds: rule.compulsory,
        currentCount: selectedCount,
        targetCount: target,
        isStrict: rule.strict ?? true,
        type: 'compulsory',
        flowCode
      });
    }

    // 2. Pool (N of List)
    if (rule.pool && rule.required_count) {
      const selectedCount = rule.pool.filter(id => selectedIds.includes(id)).length;
      const isMet = selectedCount >= rule.required_count;

      statuses.push({
        ruleId: `${flowCode}-${selection}-pool`,
        description: rule.description || `Επιλογή ${rule.required_count} από λίστα`,
        isMet,
        involvedCourseIds: rule.pool,
        currentCount: selectedCount,
        targetCount: rule.required_count,
        isStrict: rule.strict ?? true,
        type: 'pool',
        flowCode
      });
    }

    // 3. Options (One of Group)
    if (rule.options) {
      rule.options.forEach((group, idx) => {
        const selectedCount = group.filter(id => selectedIds.includes(id)).length;
        const isMet = selectedCount >= 1; // "One of" implies >= 1? Usually exactly 1 if "or". But "At least 1".

        statuses.push({
          ruleId: `${flowCode}-${selection}-opt-${idx}`,
          description: rule?.description || `Επιλογή 1 από ομάδα ${idx+1}`,
          isMet,
          involvedCourseIds: group,
          currentCount: selectedCount,
          targetCount: 1,
          isStrict: rule?.strict ?? true,
          type: 'options',
          flowCode
        });
      });
    }
  });

  return statuses;
};
