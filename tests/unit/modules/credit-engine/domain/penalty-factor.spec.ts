import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import type { MarketDebtType } from '../../../../../src/modules/credit-engine/domain/customer.schema';
import { getPenaltyFactor } from '../../../../../src/modules/credit-engine/domain/penalty-factor';

const configuration = loadRuleConfiguration();
const baseCustomer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 500,
  has_market_debt: true,
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' as const },
  job_title: 'Engineer',
};

describe('getPenaltyFactor', () => {
  it.each([
    [['credit_default'], 0.5],
    [['loan_default'], 0.5],
    [['credit_default', 'loan_default'], 0.5],
    [[], 1],
    [['credit_card'], 1],
  ] satisfies [MarketDebtType[], number][])('returns %s for debt types %j', (debtTypes, factor) => {
    expect(getPenaltyFactor({ ...baseCustomer, market_debt_types: debtTypes }, configuration)).toBe(
      factor,
    );
  });
});
