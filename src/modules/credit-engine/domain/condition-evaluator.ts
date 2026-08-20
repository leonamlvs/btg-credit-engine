import type { Condition } from '../config/rule-configuration.schema';
import type { Customer } from './customer.schema';

const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

function containsStandaloneTerm(source: string, term: string) {
  const normalizedSource = source.toLowerCase();
  const normalizedTerm = term.toLowerCase();
  let startIndex = normalizedSource.indexOf(normalizedTerm);

  while (startIndex >= 0) {
    const before = normalizedSource[startIndex - 1];
    const after = normalizedSource[startIndex + normalizedTerm.length];
    const hasLetterOrNumberBefore = before !== undefined && LETTER_OR_NUMBER.test(before);
    const hasLetterOrNumberAfter = after !== undefined && LETTER_OR_NUMBER.test(after);

    if (!hasLetterOrNumberBefore && !hasLetterOrNumberAfter) {
      return true;
    }

    startIndex = normalizedSource.indexOf(normalizedTerm, startIndex + 1);
  }

  return false;
}

export function evaluateCondition(customer: Customer, condition: Condition): boolean {
  switch (condition.operator) {
    case 'greaterThanOrEqual':
      return customer[condition.field] >= condition.value;
    case 'inclusiveRange':
      return (
        customer[condition.field] >= condition.minimum &&
        customer[condition.field] <= condition.maximum
      );
    case 'equals':
      return customer.has_market_debt === condition.value;
    case 'containsAny':
      return condition.values.some((value) => customer.market_debt_types.includes(value));
    case 'containsNone':
      return condition.values.every((value) => !customer.market_debt_types.includes(value));
    case 'containsAnySubstringCaseInsensitive': {
      const normalizedTitle = customer.job_title.toLowerCase();
      return condition.values.some((value) => normalizedTitle.includes(value.toLowerCase()));
    }
    case 'containsStandaloneTermCaseInsensitive':
      return condition.values.some((value) => containsStandaloneTerm(customer.job_title, value));
    case 'always':
      return true;
  }
}

export function evaluateAllConditions(
  customer: Customer,
  conditions: readonly Condition[],
): boolean {
  return conditions.every((condition) => evaluateCondition(customer, condition));
}

export function evaluateAnyCondition(
  customer: Customer,
  conditions: readonly Condition[],
): boolean {
  return conditions.some((condition) => evaluateCondition(customer, condition));
}
