import type { RuleConfiguration } from '../config/rule-configuration.schema';

export function getMonthlyIncome(
  clusterCode: string,
  jobCategoryCode: string,
  configuration: RuleConfiguration,
): number {
  const income = configuration.monthlyIncome[clusterCode]?.[jobCategoryCode];

  if (income === undefined) {
    throw new Error(`Missing monthly income for ${clusterCode} and ${jobCategoryCode}`);
  }

  return income;
}
