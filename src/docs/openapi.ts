import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const HealthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.literal('ok'),
  }),
);

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: {
    200: {
      description: 'Application is healthy.',
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'BTG Pactual Credit Engine API',
      version: '0.1.0',
      description: 'Backend challenge API.',
    },
  });
}
