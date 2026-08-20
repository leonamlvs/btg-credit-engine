import { describe, expect, it } from '@jest/globals';

import {
  loadRuleConfiguration,
  parseRuleConfiguration,
} from '../../../../../src/modules/credit-engine/config/load-rule-configuration';

describe('loadRuleConfiguration', () => {
  it('loads, validates, and freezes the approved versioned configuration', () => {
    const configuration = loadRuleConfiguration();

    expect(configuration.schemaVersion).toBe(1);
    expect(configuration.clusters).toHaveLength(4);
    expect(configuration.jobCategories).toHaveLength(5);
    expect(Object.isFrozen(configuration)).toBe(true);
    expect(Object.isFrozen(configuration.clusters[0])).toBe(true);
  });

  it('rejects invalid source data', () => {
    expect(() => parseRuleConfiguration({ schemaVersion: 1 })).toThrow();
  });
});
