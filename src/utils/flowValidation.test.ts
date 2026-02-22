import { describe, it, expect } from 'vitest';
import { validateDirectionSelection, type FlowSelection } from './flowValidation';

describe('validateDirectionSelection', () => {
  const emptyFlows: Record<string, FlowSelection> = {};

  it('should return error when direction is null', () => {
    const result = validateDirectionSelection(null, emptyFlows);
    expect(result).toEqual({
      isValid: false,
      error: 'Παρακαλώ επιλέξτε Κατεύθυνση.'
    });
  });

  it('should return error when direction is invalid', () => {
    // Cast to any to simulate invalid input
    const result = validateDirectionSelection('InvalidDirection' as any, emptyFlows);
    expect(result).toEqual({
      isValid: false,
      error: 'Άγνωστη Κατεύθυνση.'
    });
  });

  it('should return error for valid direction but invalid flows', () => {
    // 'Electronics' requires specific flows which are missing here
    const result = validateDirectionSelection('Electronics', emptyFlows);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Δεν πληρούνται οι κανόνες της Ηλεκτρονικής.');
  });
});
