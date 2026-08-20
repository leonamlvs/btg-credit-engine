import { describe, expect, it } from '@jest/globals';

import { loadRuleConfiguration } from '../../../../../src/modules/credit-engine/config/load-rule-configuration';
import { RuleConfigurationSchema } from '../../../../../src/modules/credit-engine/config/rule-configuration.schema';

function mutableConfiguration() {
  return structuredClone(loadRuleConfiguration());
}

describe('RuleConfigurationSchema', () => {
  it('contains every approved cluster, category, matrix value, and penalty value', () => {
    const configuration = loadRuleConfiguration();

    expect(configuration.clusters).toEqual([
      expect.objectContaining({
        code: 'CLUSTER_A',
        name: 'Diamond',
        priority: 1,
        baseLimit: 50000,
        cap: 100000,
        approved: true,
      }),
      expect.objectContaining({
        code: 'CLUSTER_B',
        name: 'Gold',
        priority: 2,
        baseLimit: 20000,
        cap: 40000,
        approved: true,
      }),
      expect.objectContaining({
        code: 'CLUSTER_C',
        name: 'Silver',
        priority: 3,
        baseLimit: 5000,
        cap: 10000,
        approved: true,
      }),
      expect.objectContaining({
        code: 'CLUSTER_D',
        name: 'Bronze',
        priority: 4,
        baseLimit: 0,
        cap: 0,
        approved: false,
      }),
    ]);

    expect(
      configuration.jobCategories.map(({ code, priority, multiplier }) => ({
        code,
        priority,
        multiplier,
      })),
    ).toEqual([
      { code: 'EXECUTIVE', priority: 1, multiplier: 2 },
      { code: 'SENIOR_PROFESSIONAL', priority: 2, multiplier: 1.5 },
      { code: 'MID_PROFESSIONAL', priority: 3, multiplier: 1 },
      { code: 'JUNIOR_PROFESSIONAL', priority: 4, multiplier: 0.7 },
      { code: 'OTHER', priority: 5, multiplier: 0.8 },
    ]);

    const executiveKeywords = configuration.jobCategories[0]?.matchAny.flatMap((condition) =>
      'values' in condition ? condition.values : [],
    );
    expect(executiveKeywords).toEqual([
      'CEO',
      'CFO',
      'CTO',
      'COO',
      'CIO',
      'CMO',
      'Chief',
      'President',
      'Vice President',
      'VP',
      'Director',
    ]);

    expect(configuration.monthlyIncome).toEqual({
      CLUSTER_A: {
        EXECUTIVE: 30000,
        SENIOR_PROFESSIONAL: 20000,
        MID_PROFESSIONAL: 12000,
        JUNIOR_PROFESSIONAL: 8000,
        OTHER: 10000,
      },
      CLUSTER_B: {
        EXECUTIVE: 20000,
        SENIOR_PROFESSIONAL: 15000,
        MID_PROFESSIONAL: 8000,
        JUNIOR_PROFESSIONAL: 5000,
        OTHER: 6500,
      },
      CLUSTER_C: {
        EXECUTIVE: 10000,
        SENIOR_PROFESSIONAL: 7000,
        MID_PROFESSIONAL: 5000,
        JUNIOR_PROFESSIONAL: 3000,
        OTHER: 4000,
      },
      CLUSTER_D: {
        EXECUTIVE: 0,
        SENIOR_PROFESSIONAL: 0,
        MID_PROFESSIONAL: 0,
        JUNIOR_PROFESSIONAL: 0,
        OTHER: 0,
      },
    });
    expect(configuration.penalties).toEqual([
      expect.objectContaining({ code: 'DEFAULT_DEBT_PENALTY', priority: 1, factor: 0.5 }),
    ]);
  });

  it('uses standalone matching only for the approved executive acronyms', () => {
    const executive = loadRuleConfiguration().jobCategories[0];
    const standaloneTerms = executive?.matchAny
      .filter(({ operator }) => operator === 'containsStandaloneTermCaseInsensitive')
      .flatMap((condition) => ('values' in condition ? condition.values : []));

    expect(standaloneTerms).toEqual(['CEO', 'CFO', 'CTO', 'COO', 'CIO', 'CMO', 'VP']);
  });

  it.each([
    [
      'duplicate cluster code',
      (source: ReturnType<typeof mutableConfiguration>) => {
        source.clusters[1]!.code = source.clusters[0]!.code;
      },
    ],
    [
      'duplicate priority',
      (source: ReturnType<typeof mutableConfiguration>) => {
        source.jobCategories[1]!.priority = source.jobCategories[0]!.priority;
      },
    ],
    [
      'missing fallback',
      (source: ReturnType<typeof mutableConfiguration>) => {
        source.clusters[3]!.conditions = [
          { operator: 'greaterThanOrEqual', field: 'score', value: 0 },
        ];
      },
    ],
    [
      'incomplete income matrix',
      (source: ReturnType<typeof mutableConfiguration>) => {
        delete source.monthlyIncome.CLUSTER_A?.OTHER;
      },
    ],
    [
      'numeric job matcher',
      (source: ReturnType<typeof mutableConfiguration>) => {
        source.jobCategories[0]!.matchAny = [
          { operator: 'greaterThanOrEqual', field: 'score', value: 700 },
        ];
      },
    ],
    [
      'always mixed with conditions',
      (source: ReturnType<typeof mutableConfiguration>) => {
        source.clusters[0]!.conditions.push({ operator: 'always' });
      },
    ],
  ])('rejects %s', (_label, mutate) => {
    const source = mutableConfiguration();
    mutate(source);

    expect(RuleConfigurationSchema.safeParse(source).success).toBe(false);
  });

  it('rejects incompatible field/operator combinations', () => {
    const source = mutableConfiguration() as unknown as {
      clusters: { conditions: unknown[] }[];
    };
    source.clusters[0]!.conditions = [
      { operator: 'containsAny', field: 'job_title', values: ['credit_default'] },
    ];

    expect(RuleConfigurationSchema.safeParse(source).success).toBe(false);
  });
});
