import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import { classifyCluster } from '../../../../../src/modules/credit-engine/domain/cluster-classifier';
import type { Customer } from '../../../../../src/modules/credit-engine/domain/customer.schema';

const configuration = loadRuleConfiguration();
const baseCustomer: Customer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: [],
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  job_title: 'Engineer',
};

function classify(overrides: Partial<Customer>) {
  return classifyCluster({ ...baseCustomer, ...overrides }, configuration);
}

describe('classifyCluster', () => {
  it.each([25, 60])('assigns CLUSTER_A at age boundary %i', (age) => {
    expect(classify({ score: 700, age, has_market_debt: false }).code).toBe('CLUSTER_A');
  });

  it('evaluates the debt flag independently from debt types for CLUSTER_A', () => {
    expect(
      classify({
        score: 700,
        age: 35,
        has_market_debt: false,
        market_debt_types: ['credit_default'],
      }).code,
    ).toBe('CLUSTER_A');
  });

  it.each([24, 61])('continues from A to B outside A age boundary %i', (age) => {
    expect(classify({ score: 700, age, has_market_debt: true }).code).toBe('CLUSTER_B');
  });

  it.each([18, 65])('assigns CLUSTER_B at age boundary %i', (age) => {
    expect(classify({ score: 500, age, has_market_debt: true }).code).toBe('CLUSTER_B');
  });

  it.each([
    { age: 17, score: 500 },
    { age: 66, score: 500 },
    { age: 35, score: 499 },
  ])('continues from B to C outside a B boundary', (overrides) => {
    expect(classify({ ...overrides, has_market_debt: true }).code).toBe('CLUSTER_C');
  });

  it.each([
    { marketDebtTypes: ['credit_default'] as const },
    { marketDebtTypes: ['loan_default'] as const },
    { marketDebtTypes: ['credit_default', 'loan_default'] as const },
  ])('default debt $marketDebtTypes excludes CLUSTER_B', ({ marketDebtTypes }) => {
    expect(
      classify({
        score: 500,
        age: 35,
        has_market_debt: true,
        market_debt_types: [...marketDebtTypes],
      }).code,
    ).toBe('CLUSTER_C');
  });

  it('assigns CLUSTER_C at its threshold regardless of age and debt', () => {
    expect(
      classify({
        score: 300,
        age: -50,
        market_debt_types: ['credit_default'],
      }),
    ).toEqual(expect.objectContaining({ code: 'CLUSTER_C', approved: true }));
  });

  it('assigns denied CLUSTER_D as the catch-all', () => {
    expect(classify({ score: 299 })).toEqual(
      expect.objectContaining({
        code: 'CLUSTER_D',
        name: 'Bronze',
        baseLimit: 0,
        cap: 0,
        approved: false,
      }),
    );
  });

  it('selects the first matching cluster without mutating configured order', () => {
    const prioritiesBefore = configuration.clusters.map(({ priority }) => priority);

    expect(classify({ score: 900, age: 35, has_market_debt: false }).code).toBe('CLUSTER_A');
    expect(configuration.clusters.map(({ priority }) => priority)).toEqual(prioritiesBefore);
  });
});
