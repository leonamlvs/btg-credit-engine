import type { RuleConfiguration } from '../config/rule-configuration.schema';
import { classifyCluster } from '../domain/cluster-classifier';
import { calculateApprovedLimit } from '../domain/credit-limit';
import type { Customer } from '../domain/customer.schema';
import { classifyJobCategory } from '../domain/job-category-classifier';
import { getMonthlyIncome } from '../domain/monthly-income';
import { getPenaltyFactor } from '../domain/penalty-factor';

export interface CoreClassification {
  clusterCode: string;
  clusterName: string;
  jobCategoryCode: string;
  monthlyIncome: number;
  approved: boolean;
  approvedLimit: number;
}

export type CustomerClassifier = (customer: Customer) => CoreClassification;

export function createCustomerClassifier(configuration: RuleConfiguration): CustomerClassifier {
  return (customer) => classifyCustomer(customer, configuration);
}

export function classifyCustomer(
  customer: Customer,
  configuration: RuleConfiguration,
): CoreClassification {
  const cluster = classifyCluster(customer, configuration);
  const jobCategory = classifyJobCategory(customer, configuration);
  const monthlyIncome = getMonthlyIncome(cluster.code, jobCategory.code, configuration);
  const penaltyFactor = getPenaltyFactor(customer, configuration);
  const approvedLimit = calculateApprovedLimit(cluster, jobCategory, penaltyFactor);

  return {
    clusterCode: cluster.code,
    clusterName: cluster.name,
    jobCategoryCode: jobCategory.code,
    monthlyIncome,
    approved: cluster.approved,
    approvedLimit,
  };
}
