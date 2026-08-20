import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import { CustomerSchema } from '../modules/credit-engine/domain/customer.schema';
import {
  ClassificationResponseSchema,
  ErrorResponseSchema,
} from '../modules/credit-engine/http/classification-contracts';
import { z } from '../shared/schema/zod';

const registry = new OpenAPIRegistry();

const HealthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.literal('ok'),
  }),
);

const RegisteredCustomerSchema = registry.register('Customer', CustomerSchema);
const RegisteredClassificationResponseSchema = registry.register(
  'ClassificationResponse',
  ClassificationResponseSchema,
);
const RegisteredErrorResponseSchema = registry.register('ErrorResponse', ErrorResponseSchema);

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

registry.registerPath({
  method: 'post',
  path: '/customers/classify',
  summary: 'Classify a customer and calculate income and credit limit',
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: RegisteredCustomerSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Customer classified successfully.',
      content: {
        'application/json': {
          schema: RegisteredClassificationResponseSchema,
        },
      },
    },
    400: {
      description: 'Request validation or JSON parsing failed.',
      content: {
        'application/json': {
          schema: RegisteredErrorResponseSchema,
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
