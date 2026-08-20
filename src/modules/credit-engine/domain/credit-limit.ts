import type { ClusterRule, JobCategoryRule } from '../config/rule-configuration.schema';

export function calculatePreRoundLimit(
  baseLimit: number,
  jobMultiplier: number,
  penaltyFactor: number,
  clusterCap: number,
): number {
  return Math.min(baseLimit * jobMultiplier * penaltyFactor, clusterCap);
}

export function roundToNearestHundred(amount: number): number {
  return Math.floor((amount + 50) / 100) * 100;
}

export function calculateApprovedLimit(
  cluster: ClusterRule,
  jobCategory: JobCategoryRule,
  penaltyFactor: number,
): number {
  if (!cluster.approved) {
    return 0;
  }

  return roundToNearestHundred(
    calculatePreRoundLimit(cluster.baseLimit, jobCategory.multiplier, penaltyFactor, cluster.cap),
  );
}
