import type { JobCategoryRule, RuleConfiguration } from '../config/rule-configuration.schema';
import { evaluateAnyCondition } from './condition-evaluator';
import type { Customer } from './customer.schema';

export function classifyJobCategory(
  customer: Customer,
  configuration: RuleConfiguration,
): JobCategoryRule {
  const category = [...configuration.jobCategories]
    .sort((left, right) => left.priority - right.priority)
    .find(({ matchAny }) => evaluateAnyCondition(customer, matchAny));

  if (category === undefined) {
    throw new Error('Validated rule configuration did not produce a job category');
  }

  return category;
}
