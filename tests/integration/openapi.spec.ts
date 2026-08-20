import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

import { createTestApp } from '../helpers/create-test-app';

describe('GET /openapi.json', () => {
  it('documents the classification operation using reusable runtime schemas', async () => {
    const response = await request(createTestApp()).get('/openapi.json');
    const document: unknown = response.body;

    expect(response.status).toBe(200);
    expect(document).toEqual(
      expect.objectContaining({
        paths: expect.objectContaining({
          '/customers/classify': expect.objectContaining({
            post: expect.objectContaining({
              requestBody: expect.objectContaining({ required: true }),
              responses: expect.objectContaining({
                '200': expect.any(Object),
                '400': expect.any(Object),
              }),
            }),
          }),
        }),
        components: expect.objectContaining({
          schemas: expect.objectContaining({
            Customer: expect.any(Object),
            ClassificationResponse: expect.any(Object),
            ErrorResponse: expect.any(Object),
          }),
        }),
      }),
    );
  });
});
