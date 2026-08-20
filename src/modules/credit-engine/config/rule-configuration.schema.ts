import { z } from 'zod';

import { MarketDebtTypeSchema } from '../domain/customer.schema';

const NumericFieldSchema = z.enum(['score', 'age']);

const GreaterThanOrEqualConditionSchema = z.object({
  operator: z.literal('greaterThanOrEqual'),
  field: NumericFieldSchema,
  value: z.number(),
});

const InclusiveRangeConditionSchema = z
  .object({
    operator: z.literal('inclusiveRange'),
    field: NumericFieldSchema,
    minimum: z.number(),
    maximum: z.number(),
  })
  .refine(({ minimum, maximum }) => minimum <= maximum, {
    message: 'minimum must be less than or equal to maximum',
  });

const EqualsConditionSchema = z.object({
  operator: z.literal('equals'),
  field: z.literal('has_market_debt'),
  value: z.boolean(),
});

const ContainsAnyConditionSchema = z.object({
  operator: z.literal('containsAny'),
  field: z.literal('market_debt_types'),
  values: z.array(MarketDebtTypeSchema).min(1),
});

const ContainsNoneConditionSchema = z.object({
  operator: z.literal('containsNone'),
  field: z.literal('market_debt_types'),
  values: z.array(MarketDebtTypeSchema).min(1),
});

const ContainsAnySubstringCaseInsensitiveConditionSchema = z.object({
  operator: z.literal('containsAnySubstringCaseInsensitive'),
  field: z.literal('job_title'),
  values: z.array(z.string().min(1)).min(1),
});

const ContainsStandaloneTermCaseInsensitiveConditionSchema = z.object({
  operator: z.literal('containsStandaloneTermCaseInsensitive'),
  field: z.literal('job_title'),
  values: z.array(z.string().min(1)).min(1),
});

const AlwaysConditionSchema = z.object({
  operator: z.literal('always'),
});

export const ConditionSchema = z.union([
  GreaterThanOrEqualConditionSchema,
  InclusiveRangeConditionSchema,
  EqualsConditionSchema,
  ContainsAnyConditionSchema,
  ContainsNoneConditionSchema,
  ContainsAnySubstringCaseInsensitiveConditionSchema,
  ContainsStandaloneTermCaseInsensitiveConditionSchema,
  AlwaysConditionSchema,
]);

const ClusterRuleSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int().positive(),
  baseLimit: z.number().nonnegative(),
  cap: z.number().nonnegative(),
  approved: z.boolean(),
  conditions: z.array(ConditionSchema).min(1),
});

const JobCategoryRuleSchema = z.object({
  code: z.string().min(1),
  priority: z.number().int().positive(),
  multiplier: z.number().nonnegative(),
  matchAny: z.array(ConditionSchema).min(1),
});

const PenaltyRuleSchema = z.object({
  code: z.string().min(1),
  priority: z.number().int().positive(),
  factor: z.number().nonnegative(),
  conditions: z.array(ConditionSchema).min(1),
});

function addDuplicateIssues(
  values: readonly (string | number)[],
  label: string,
  path: (string | number)[],
  context: z.RefinementCtx,
) {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: 'custom', message: `${label} must be unique`, path });
  }
}

function isFallback(conditions: readonly z.infer<typeof ConditionSchema>[]) {
  return conditions.length === 1 && conditions[0]?.operator === 'always';
}

export const RuleConfigurationSchema = z
  .object({
    schemaVersion: z.literal(1),
    clusters: z.array(ClusterRuleSchema).min(1),
    jobCategories: z.array(JobCategoryRuleSchema).min(1),
    monthlyIncome: z.record(z.string(), z.record(z.string(), z.number().nonnegative())),
    penalties: z.array(PenaltyRuleSchema).min(1),
  })
  .superRefine((configuration, context) => {
    addDuplicateIssues(
      configuration.clusters.map(({ code }) => code),
      'Cluster codes',
      ['clusters'],
      context,
    );
    addDuplicateIssues(
      configuration.clusters.map(({ priority }) => priority),
      'Cluster priorities',
      ['clusters'],
      context,
    );
    addDuplicateIssues(
      configuration.jobCategories.map(({ code }) => code),
      'Job category codes',
      ['jobCategories'],
      context,
    );
    addDuplicateIssues(
      configuration.jobCategories.map(({ priority }) => priority),
      'Job category priorities',
      ['jobCategories'],
      context,
    );
    addDuplicateIssues(
      configuration.penalties.map(({ code }) => code),
      'Penalty codes',
      ['penalties'],
      context,
    );
    addDuplicateIssues(
      configuration.penalties.map(({ priority }) => priority),
      'Penalty priorities',
      ['penalties'],
      context,
    );

    const clusterFallbacks = configuration.clusters.filter(({ conditions }) =>
      isFallback(conditions),
    );
    const jobFallbacks = configuration.jobCategories.filter(({ matchAny }) => isFallback(matchAny));

    for (const [index, cluster] of configuration.clusters.entries()) {
      const containsJobTitleMatcher = cluster.conditions.some(({ operator }) =>
        ['containsAnySubstringCaseInsensitive', 'containsStandaloneTermCaseInsensitive'].includes(
          operator,
        ),
      );
      if (containsJobTitleMatcher) {
        context.addIssue({
          code: 'custom',
          message: 'Cluster rules cannot contain job-title matchers',
          path: ['clusters', index, 'conditions'],
        });
      }
      if (
        cluster.conditions.some(({ operator }) => operator === 'always') &&
        !isFallback(cluster.conditions)
      ) {
        context.addIssue({
          code: 'custom',
          message: 'The always condition is reserved for the explicit cluster fallback',
          path: ['clusters', index, 'conditions'],
        });
      }
    }

    for (const [index, category] of configuration.jobCategories.entries()) {
      const containsInvalidMatcher = category.matchAny.some(
        ({ operator }) =>
          ![
            'containsAnySubstringCaseInsensitive',
            'containsStandaloneTermCaseInsensitive',
            'always',
          ].includes(operator),
      );
      if (containsInvalidMatcher) {
        context.addIssue({
          code: 'custom',
          message: 'Job categories can contain only approved job-title matchers',
          path: ['jobCategories', index, 'matchAny'],
        });
      }
      if (
        category.matchAny.some(({ operator }) => operator === 'always') &&
        !isFallback(category.matchAny)
      ) {
        context.addIssue({
          code: 'custom',
          message: 'The always condition is reserved for the explicit job-category fallback',
          path: ['jobCategories', index, 'matchAny'],
        });
      }
    }

    if (clusterFallbacks.length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'Clusters must contain exactly one explicit fallback',
        path: ['clusters'],
      });
    } else if (
      clusterFallbacks[0]?.priority !==
      Math.max(...configuration.clusters.map(({ priority }) => priority))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Cluster fallback must have the lowest priority',
        path: ['clusters'],
      });
    }

    if (jobFallbacks.length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'Job categories must contain exactly one explicit fallback',
        path: ['jobCategories'],
      });
    } else if (
      jobFallbacks[0]?.priority !==
      Math.max(...configuration.jobCategories.map(({ priority }) => priority))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Job category fallback must have the lowest priority',
        path: ['jobCategories'],
      });
    }

    for (const [index, cluster] of configuration.clusters.entries()) {
      if (cluster.baseLimit > cluster.cap) {
        context.addIssue({
          code: 'custom',
          message: 'Cluster base limit must not exceed its cap',
          path: ['clusters', index, 'baseLimit'],
        });
      }

      const incomeRow = configuration.monthlyIncome[cluster.code];
      if (incomeRow === undefined) {
        context.addIssue({
          code: 'custom',
          message: `Missing income row for ${cluster.code}`,
          path: ['monthlyIncome'],
        });
        continue;
      }

      const expectedCategories = new Set(configuration.jobCategories.map(({ code }) => code));
      const actualCategories = new Set(Object.keys(incomeRow));
      if (
        expectedCategories.size !== actualCategories.size ||
        [...expectedCategories].some((code) => !actualCategories.has(code))
      ) {
        context.addIssue({
          code: 'custom',
          message: `Income row for ${cluster.code} must contain every job category exactly once`,
          path: ['monthlyIncome', cluster.code],
        });
      }
    }

    const configuredClusters = new Set(configuration.clusters.map(({ code }) => code));
    if (
      configuredClusters.size !== Object.keys(configuration.monthlyIncome).length ||
      Object.keys(configuration.monthlyIncome).some((code) => !configuredClusters.has(code))
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Income matrix must contain every cluster exactly once',
        path: ['monthlyIncome'],
      });
    }
  });

export type Condition = z.infer<typeof ConditionSchema>;
export type RuleConfiguration = z.infer<typeof RuleConfigurationSchema>;
export type ClusterRule = RuleConfiguration['clusters'][number];
export type JobCategoryRule = RuleConfiguration['jobCategories'][number];
export type PenaltyRule = RuleConfiguration['penalties'][number];
