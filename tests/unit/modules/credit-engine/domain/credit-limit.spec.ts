import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import {
  calculateApprovedLimit,
  calculatePreRoundLimit,
  roundToNearestHundred,
} from '../../../../../src/modules/credit-engine/domain/credit-limit';

const configuration = loadRuleConfiguration();

describe('calculatePreRoundLimit', () => {
  it('applies base, multiplier, and identity penalty before the cap', () => {
    expect(calculatePreRoundLimit(5000, 1, 1, 10000)).toBe(5000);
  });

  it('applies the penalty before enforcing the cap', () => {
    expect(calculatePreRoundLimit(60000, 2, 0.5, 100000)).toBe(60000);
  });

  it('enforces the cap after multiplication', () => {
    expect(calculatePreRoundLimit(60000, 2, 1, 100000)).toBe(100000);
  });
});

describe('roundToNearestHundred', () => {
  it.each([
    [10149, 10100],
    [10151, 10200],
    [1750, 1800],
    [3750, 3800],
  ])('rounds %i to %i', (amount, expected) => {
    expect(roundToNearestHundred(amount)).toBe(expected);
  });
});

describe('calculateApprovedLimit', () => {
  it('composes the configured cluster and category values', () => {
    const clusterC = configuration.clusters.find(({ code }) => code === 'CLUSTER_C')!;
    const junior = configuration.jobCategories.find(({ code }) => code === 'JUNIOR_PROFESSIONAL')!;

    expect(calculateApprovedLimit(clusterC, junior, 0.5)).toBe(1800);
  });

  it('enforces the configured cluster cap', () => {
    const clusterA = configuration.clusters.find(({ code }) => code === 'CLUSTER_A')!;
    const executive = configuration.jobCategories.find(({ code }) => code === 'EXECUTIVE')!;

    expect(calculateApprovedLimit(clusterA, executive, 1)).toBe(100000);
  });

  it('always returns zero for the denied configured cluster', () => {
    const clusterD = configuration.clusters.find(({ code }) => code === 'CLUSTER_D')!;
    const executive = configuration.jobCategories.find(({ code }) => code === 'EXECUTIVE')!;

    expect(calculateApprovedLimit(clusterD, executive, 1)).toBe(0);
  });
});
