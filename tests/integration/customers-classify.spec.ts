import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { ClassificationResponseSchema } from '../../src/modules/credit-engine/http/classification-contracts';
import { createTestApp } from '../helpers/create-test-app';

const baseCustomer = {
  id: 'customer-1',
  name: 'Ana Silva',
  age: 35,
  score: 700,
  has_market_debt: false,
  market_debt_types: [],
  location: { city: 'São Paulo', state: 'SP', region: 'Sudeste' },
  job_title: 'CTO',
};

function customerWithoutName() {
  const customer: Partial<typeof baseCustomer> = { ...baseCustomer };
  delete customer.name;
  return customer;
}

describe('POST /customers/classify', () => {
  it.each([
    {
      label: 'CLUSTER_A',
      customer: baseCustomer,
      calculated: {
        cluster_id: 'CLUSTER_A',
        cluster_name: 'Diamond',
        job_category: 'EXECUTIVE',
        monthly_income: 30000,
        approved: true,
        approved_limit: 100000,
      },
    },
    {
      label: 'CLUSTER_B',
      customer: {
        ...baseCustomer,
        score: 500,
        has_market_debt: true,
        market_debt_types: ['credit_card'],
        job_title: 'Manager',
      },
      calculated: {
        cluster_id: 'CLUSTER_B',
        cluster_name: 'Gold',
        job_category: 'SENIOR_PROFESSIONAL',
        monthly_income: 15000,
        approved: true,
        approved_limit: 30000,
      },
    },
    {
      label: 'CLUSTER_C',
      customer: {
        ...baseCustomer,
        score: 300,
        has_market_debt: true,
        market_debt_types: ['credit_default'],
        job_title: 'Junior',
      },
      calculated: {
        cluster_id: 'CLUSTER_C',
        cluster_name: 'Silver',
        job_category: 'JUNIOR_PROFESSIONAL',
        monthly_income: 3000,
        approved: true,
        approved_limit: 1800,
      },
    },
    {
      label: 'CLUSTER_D',
      customer: { ...baseCustomer, score: 299, job_title: 'Teacher' },
      calculated: {
        cluster_id: 'CLUSTER_D',
        cluster_name: 'Bronze',
        job_category: 'OTHER',
        monthly_income: 0,
        approved: false,
        approved_limit: 0,
      },
    },
  ])('returns the enriched approved contract for $label', async ({ customer, calculated }) => {
    const response = await request(createTestApp()).post('/customers/classify').send(customer);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...customer, ...calculated });
  });

  it('preserves accepted additional properties and overwrites calculated field names', async () => {
    const customer = {
      ...baseCustomer,
      cluster_id: 'untrusted-value',
      source: 'mobile',
      location: { ...baseCustomer.location, neighborhood: 'Centro' },
    };

    const response = await request(createTestApp()).post('/customers/classify').send(customer);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        source: 'mobile',
        location: expect.objectContaining({ neighborhood: 'Centro' }),
        cluster_id: 'CLUSTER_A',
      }),
    );
  });

  it.each([
    ['missing field', customerWithoutName(), 'name'],
    ['wrong type', { ...baseCustomer, age: '35' }, 'age'],
    ['score below range', { ...baseCustomer, score: -1 }, 'score'],
    [
      'invalid region',
      { ...baseCustomer, location: { ...baseCustomer.location, region: 'Southeast' } },
      'location.region',
    ],
    [
      'invalid debt type',
      { ...baseCustomer, market_debt_types: ['overdraft'] },
      'market_debt_types.0',
    ],
  ])('returns VALIDATION_ERROR for %s', async (_label, customer, expectedPath) => {
    const response = await request(createTestApp()).post('/customers/classify').send(customer);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: expect.arrayContaining([expect.objectContaining({ path: expectedPath })]),
        }),
      }),
    );
  });

  it('returns the shared MALFORMED_JSON envelope without parser internals', async () => {
    const response = await request(createTestApp())
      .post('/customers/classify')
      .set('Content-Type', 'application/json')
      .send('{"id":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'MALFORMED_JSON',
        message: 'Request body contains invalid JSON',
        details: [],
      },
    });
  });

  it('keeps calls independent and permits repeated identifiers', async () => {
    const app = createTestApp();
    const first = await request(app).post('/customers/classify').send(baseCustomer);
    const second = await request(app)
      .post('/customers/classify')
      .send({ ...baseCustomer, score: 299 });
    const firstBody = ClassificationResponseSchema.parse(first.body);
    const secondBody = ClassificationResponseSchema.parse(second.body);

    expect(firstBody.cluster_id).toBe('CLUSTER_A');
    expect(secondBody.cluster_id).toBe('CLUSTER_D');
    expect(secondBody.id).toBe(firstBody.id);
  });
});
