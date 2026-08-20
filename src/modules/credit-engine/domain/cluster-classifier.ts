import type { ClusterRule, RuleConfiguration } from '../config/rule-configuration.schema';
import { evaluateAllConditions } from './condition-evaluator';
import type { Customer } from './customer.schema';

export function classifyCluster(customer: Customer, configuration: RuleConfiguration): ClusterRule {
  const cluster = [...configuration.clusters]
    .sort((left, right) => left.priority - right.priority)
    .find(({ conditions }) => evaluateAllConditions(customer, conditions));

  if (cluster === undefined) {
    throw new Error('Validated rule configuration did not produce a cluster');
  }

  return cluster;
}
