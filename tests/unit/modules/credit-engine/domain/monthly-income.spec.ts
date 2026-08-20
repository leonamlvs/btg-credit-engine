import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import { getMonthlyIncome } from '../../../../../src/modules/credit-engine/domain/monthly-income';

const configuration = loadRuleConfiguration();
const matrix = [
  ['CLUSTER_A', 'EXECUTIVE', 30000],
  ['CLUSTER_A', 'SENIOR_PROFESSIONAL', 20000],
  ['CLUSTER_A', 'MID_PROFESSIONAL', 12000],
  ['CLUSTER_A', 'JUNIOR_PROFESSIONAL', 8000],
  ['CLUSTER_A', 'OTHER', 10000],
  ['CLUSTER_B', 'EXECUTIVE', 20000],
  ['CLUSTER_B', 'SENIOR_PROFESSIONAL', 15000],
  ['CLUSTER_B', 'MID_PROFESSIONAL', 8000],
  ['CLUSTER_B', 'JUNIOR_PROFESSIONAL', 5000],
  ['CLUSTER_B', 'OTHER', 6500],
  ['CLUSTER_C', 'EXECUTIVE', 10000],
  ['CLUSTER_C', 'SENIOR_PROFESSIONAL', 7000],
  ['CLUSTER_C', 'MID_PROFESSIONAL', 5000],
  ['CLUSTER_C', 'JUNIOR_PROFESSIONAL', 3000],
  ['CLUSTER_C', 'OTHER', 4000],
  ['CLUSTER_D', 'EXECUTIVE', 0],
  ['CLUSTER_D', 'SENIOR_PROFESSIONAL', 0],
  ['CLUSTER_D', 'MID_PROFESSIONAL', 0],
  ['CLUSTER_D', 'JUNIOR_PROFESSIONAL', 0],
  ['CLUSTER_D', 'OTHER', 0],
] as const;

describe('getMonthlyIncome', () => {
  it.each(matrix)('returns %i for %s and %s', (cluster, category, income) => {
    expect(getMonthlyIncome(cluster, category, configuration)).toBe(income);
  });

  it('fails explicitly for an unknown matrix entry', () => {
    expect(() => getMonthlyIncome('UNKNOWN', 'OTHER', configuration)).toThrow(
      'Missing monthly income',
    );
  });
});
