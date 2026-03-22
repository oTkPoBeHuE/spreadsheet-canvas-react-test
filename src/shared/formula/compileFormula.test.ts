import { describe, expect, it } from 'vitest';

import { compileFormula } from '@/shared/formula/compileFormula';

describe('compileFormula', () => {
  it('keeps raw formulas without equals sign', () => {
    expect(compileFormula('42', 0)).toBe('42');
  });

  it('replaces named metrics with row-scoped references', () => {
    expect(compileFormula('=mrr - churn + expansion', 0)).toBe('=E1 - G1 + F1');
    expect(compileFormula('=net_revenue*(1+growth_target)', 24)).toBe('=J25*(1+I25)');
  });

  it('leaves classic A1 references untouched', () => {
    expect(compileFormula('=A1 + B10', 5)).toBe('=A1 + B10');
  });
});
