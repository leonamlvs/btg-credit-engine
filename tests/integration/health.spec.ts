import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { createTestApp } from '../helpers/create-test-app';

describe('GET /health', () => {
  it('returns the health contract and a request id', async () => {
    const response = await request(createTestApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });
});
