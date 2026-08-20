import { describe, expect, it } from '@jest/globals';

import { classifyCustomer } from '../../../../../src/modules/credit-engine/application/classify-customer';
import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
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

describe('classifyCustomer', () => {
  it('classifies an approved capped CLUSTER_A executive', () => {
    expect(classifyCustomer({ ...baseCustomer, job_title: 'CTO' }, configuration)).toEqual({
      clusterCode: 'CLUSTER_A',
      clusterName: 'Diamond',
      jobCategoryCode: 'EXECUTIVE',
      monthlyIncome: 30000,
      approved: true,
      approvedLimit: 100000,
    });
  });

  it('classifies a CLUSTER_B customer using priority-driven job matching', () => {
    expect(
      classifyCustomer(
        {
          ...baseCustomer,
          score: 500,
          has_market_debt: true,
          market_debt_types: ['credit_card'],
          job_title: 'Assistant Manager to the Director',
        },
        configuration,
      ),
    ).toEqual(
      expect.objectContaining({
        clusterCode: 'CLUSTER_B',
        jobCategoryCode: 'EXECUTIVE',
        monthlyIncome: 20000,
        approvedLimit: 40000,
      }),
    );
  });

  it('applies default debt and upward midpoint rounding to CLUSTER_C', () => {
    expect(
      classifyCustomer(
        {
          ...baseCustomer,
          score: 300,
          has_market_debt: true,
          market_debt_types: ['credit_default', 'loan_default'],
          job_title: 'Junior Developer',
        },
        configuration,
      ),
    ).toEqual(
      expect.objectContaining({
        clusterCode: 'CLUSTER_C',
        jobCategoryCode: 'MID_PROFESSIONAL',
        monthlyIncome: 5000,
        approved: true,
        approvedLimit: 2500,
      }),
    );
  });

  it('rounds the real CLUSTER_C junior default-debt combination from 1750 to 1800', () => {
    expect(
      classifyCustomer(
        {
          ...baseCustomer,
          score: 300,
          has_market_debt: true,
          market_debt_types: ['credit_default'],
          job_title: 'Junior',
        },
        configuration,
      ).approvedLimit,
    ).toBe(1800);
  });

  it('returns the complete CLUSTER_D denial result', () => {
    expect(
      classifyCustomer({ ...baseCustomer, score: 299, job_title: 'Teacher' }, configuration),
    ).toEqual({
      clusterCode: 'CLUSTER_D',
      clusterName: 'Bronze',
      jobCategoryCode: 'OTHER',
      monthlyIncome: 0,
      approved: false,
      approvedLimit: 0,
    });
  });

  it('does not mutate input and has no cross-call state', () => {
    const firstInput = structuredClone(baseCustomer);
    const unchanged = structuredClone(firstInput);
    const first = classifyCustomer(firstInput, configuration);
    const second = classifyCustomer(
      { ...baseCustomer, id: firstInput.id, score: 299 },
      configuration,
    );

    expect(firstInput).toEqual(unchanged);
    expect(first.clusterCode).toBe('CLUSTER_A');
    expect(second.clusterCode).toBe('CLUSTER_D');
  });
});
