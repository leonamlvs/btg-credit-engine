import { describe, expect, it } from '@jest/globals';

import type { Condition } from '../../../../../src/modules/credit-engine/config/rule-configuration.schema';
import {
  evaluateAllConditions,
  evaluateCondition,
} from '../../../../../src/modules/credit-engine/domain/condition-evaluator';
import type { Customer } from '../../../../../src/modules/credit-engine/domain/customer.schema';

const customer: Customer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: ['credit_card'],
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  job_title: 'Senior Engineer',
};

describe('evaluateCondition', () => {
  const cases = [
    [{ operator: 'greaterThanOrEqual', field: 'score', value: 700 }, true],
    [{ operator: 'inclusiveRange', field: 'age', minimum: 35, maximum: 35 }, true],
    [{ operator: 'equals', field: 'has_market_debt', value: false }, true],
    [{ operator: 'containsAny', field: 'market_debt_types', values: ['credit_card'] }, true],
    [{ operator: 'containsNone', field: 'market_debt_types', values: ['loan_default'] }, true],
    [
      {
        operator: 'containsAnySubstringCaseInsensitive',
        field: 'job_title',
        values: ['ENGINEER'],
      },
      true,
    ],
    [{ operator: 'always' }, true],
  ] satisfies [Condition, boolean][];

  it.each(cases)('evaluates $operator', (condition, expected) => {
    expect(evaluateCondition(customer, condition)).toBe(expected);
  });

  it('requires every condition in an all-of group', () => {
    expect(
      evaluateAllConditions(customer, [
        { operator: 'greaterThanOrEqual', field: 'score', value: 700 },
        { operator: 'equals', field: 'has_market_debt', value: true },
      ]),
    ).toBe(false);
  });

  it.each(['COO', 'COO Brazil', 'coo', '(COO)', 'ex-COO', 'COO/CTO', 'COO_Brazil'])(
    'matches standalone term in %s',
    (jobTitle) => {
      expect(
        evaluateCondition(
          { ...customer, job_title: jobTitle },
          {
            operator: 'containsStandaloneTermCaseInsensitive',
            field: 'job_title',
            values: ['COO'],
          },
        ),
      ).toBe(true);
    },
  );

  it.each(['Coordinator', 'myCOO', 'COO2', 'COOOperations'])(
    'rejects non-standalone term in %s',
    (jobTitle) => {
      expect(
        evaluateCondition(
          { ...customer, job_title: jobTitle },
          {
            operator: 'containsStandaloneTermCaseInsensitive',
            field: 'job_title',
            values: ['COO'],
          },
        ),
      ).toBe(false);
    },
  );

  it.each(['áCOO', 'COOé'])(
    'treats a Unicode letter adjacent to COO as non-standalone in %s',
    (jobTitle) => {
      expect(
        evaluateCondition(
          { ...customer, job_title: jobTitle },
          {
            operator: 'containsStandaloneTermCaseInsensitive',
            field: 'job_title',
            values: ['COO'],
          },
        ),
      ).toBe(false);
    },
  );
});
