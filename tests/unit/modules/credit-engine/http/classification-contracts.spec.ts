import { describe, expect, it } from '@jest/globals';

import { CustomerSchema } from '../../../../../src/modules/credit-engine/domain/customer.schema';
import {
  ClassificationResponseSchema,
  ErrorResponseSchema,
  mapClassificationResponse,
  mapMalformedJsonError,
  mapValidationError,
} from '../../../../../src/modules/credit-engine/http/classification-contracts';

const customer = CustomerSchema.parse({
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: [],
  location: {
    city: 'São Paulo',
    state: 'SP',
    region: 'Sudeste',
    neighborhood: 'Centro',
  },
  job_title: 'CTO',
  source: 'spec-derived',
});

describe('classification public contracts', () => {
  it('maps the accepted customer to the exact approved enriched response', () => {
    const response = mapClassificationResponse(customer, {
      clusterCode: 'CLUSTER_A',
      clusterName: 'Diamond',
      jobCategoryCode: 'EXECUTIVE',
      monthlyIncome: 30000,
      approved: true,
      approvedLimit: 100000,
    });

    expect(response).toEqual({
      ...customer,
      cluster_id: 'CLUSTER_A',
      cluster_name: 'Diamond',
      job_category: 'EXECUTIVE',
      monthly_income: 30000,
      approved: true,
      approved_limit: 100000,
    });
    expect(ClassificationResponseSchema.safeParse(response).success).toBe(true);
    expect(response).not.toHaveProperty('base_limit');
    expect(response).not.toHaveProperty('penalty_factor');
  });

  it('maps Zod issues to stable public validation details', () => {
    const result = CustomerSchema.safeParse({ ...customer, location: { region: 'invalid' } });
    expect(result.success).toBe(false);

    if (!result.success) {
      const response = mapValidationError(result.error);
      expect(ErrorResponseSchema.safeParse(response).success).toBe(true);
      expect(response).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: expect.arrayContaining([
              expect.objectContaining({ path: 'location.city' }),
              expect.objectContaining({ path: 'location.region' }),
            ]),
          }),
        }),
      );
    }
  });

  it('uses the shared error schema for malformed JSON', () => {
    const response = mapMalformedJsonError();

    expect(response).toEqual({
      error: {
        code: 'MALFORMED_JSON',
        message: 'Request body contains invalid JSON',
        details: [],
      },
    });
    expect(ErrorResponseSchema.safeParse(response).success).toBe(true);
  });

  it.each([6500, 6500.25, 6500.5])(
    'serializes BRL major-unit value %s as a JSON number',
    (amount) => {
      const response = mapClassificationResponse(customer, {
        clusterCode: 'CLUSTER_B',
        clusterName: 'Gold',
        jobCategoryCode: 'OTHER',
        monthlyIncome: amount,
        approved: true,
        approvedLimit: amount,
      });
      const serialized = JSON.parse(JSON.stringify(response)) as unknown;
      const parsed = ClassificationResponseSchema.parse(serialized);

      expect(parsed.monthly_income).toBe(amount);
      expect(parsed.approved_limit).toBe(amount);
      expect(typeof parsed.monthly_income).toBe('number');
    },
  );
});
