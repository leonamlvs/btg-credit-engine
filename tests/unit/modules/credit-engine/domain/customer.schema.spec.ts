import { describe, expect, it } from '@jest/globals';

import {
  CustomerSchema,
  MarketDebtTypeSchema,
  RegionSchema,
} from '../../../../../src/modules/credit-engine/domain/customer.schema';

const validCustomer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: [],
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  job_title: 'Engineer',
};

describe('CustomerSchema', () => {
  it('accepts the approved customer contract and preserves additional properties', () => {
    const input = {
      ...validCustomer,
      source: 'challenge',
      location: { ...validCustomer.location, postal_code: '01000-000' },
    };

    expect(CustomerSchema.parse(input)).toEqual(input);
  });

  it.each([0, 1000])('accepts score boundary %i', (score) => {
    expect(CustomerSchema.safeParse({ ...validCustomer, score }).success).toBe(true);
  });

  it.each([-1, 1001, 1.5])('rejects invalid score %s', (score) => {
    expect(CustomerSchema.safeParse({ ...validCustomer, score }).success).toBe(false);
  });

  it('requires every published field with its declared type', () => {
    const withoutName: Partial<typeof validCustomer> = { ...validCustomer };
    delete withoutName.name;

    expect(CustomerSchema.safeParse(withoutName).success).toBe(false);
    expect(CustomerSchema.safeParse({ ...validCustomer, age: '35' }).success).toBe(false);
    expect(CustomerSchema.safeParse({ ...validCustomer, location: { city: 'A' } }).success).toBe(
      false,
    );
  });

  it('accepts debt-field inconsistency and does not impose unstated constraints', () => {
    expect(
      CustomerSchema.safeParse({
        ...validCustomer,
        id: '',
        age: -10,
        has_market_debt: false,
        market_debt_types: ['credit_default'],
        location: { city: '', state: 'XX', region: 'Sudeste' },
      }).success,
    ).toBe(true);
  });
});

describe('customer enumerations', () => {
  it.each(['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'])(
    'accepts region %s',
    (region) => {
      expect(RegionSchema.safeParse(region).success).toBe(true);
    },
  );

  it.each(['credit_card', 'personal_loan', 'mortgage', 'credit_default', 'loan_default'])(
    'accepts debt type %s',
    (debtType) => {
      expect(MarketDebtTypeSchema.safeParse(debtType).success).toBe(true);
    },
  );

  it('rejects unlisted enumeration values', () => {
    expect(RegionSchema.safeParse('Southeast').success).toBe(false);
    expect(MarketDebtTypeSchema.safeParse('overdraft').success).toBe(false);
  });
});
