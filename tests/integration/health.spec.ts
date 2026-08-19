import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { createApp } from '../../src/app';

describe('GET /health', () => {
  it('returns the health contract and a request id', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });
});
