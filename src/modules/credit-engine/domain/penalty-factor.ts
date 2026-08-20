import type { RuleConfiguration } from '../config/rule-configuration.schema';
import { evaluateAllConditions } from './condition-evaluator';
import type { Customer } from './customer.schema';

export function getPenaltyFactor(customer: Customer, configuration: RuleConfiguration): number {
  const penalty = [...configuration.penalties]
    .sort((left, right) => left.priority - right.priority)
    .find(({ conditions }) => evaluateAllConditions(customer, conditions));

  return penalty?.factor ?? 1;
}
