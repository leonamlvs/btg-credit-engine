import { randomUUID } from 'node:crypto';

import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { createOpenApiDocument } from './docs/openapi';
import type { CustomerClassifier } from './modules/credit-engine/application/classify-customer';
import { CustomerSchema } from './modules/credit-engine/domain/customer.schema';
import {
  mapClassificationResponse,
  mapMalformedJsonError,
  mapValidationError,
} from './modules/credit-engine/http/classification-contracts';
import { logger } from './shared/logger/logger';

export interface ApplicationDependencies {
  classifyCustomer: CustomerClassifier;
}

function isMalformedJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    'type' in error &&
    (error as SyntaxError & { type?: unknown }).type === 'entity.parse.failed'
  );
}

export function createApp({ classifyCustomer }: ApplicationDependencies) {
  const app = express();
  const openApiDocument = createOpenApiDocument();

  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    pinoHttp({
      logger,
      genReqId(request, response) {
        const incomingRequestId = request.headers['x-request-id'];
        const requestId =
          typeof incomingRequestId === 'string' && incomingRequestId.trim().length > 0
            ? incomingRequestId
            : randomUUID();

        response.setHeader('x-request-id', requestId);

        return requestId;
      },
    }),
  );
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.post('/customers/classify', (request, response) => {
    const customerResult = CustomerSchema.safeParse(request.body);

    if (!customerResult.success) {
      response.status(400).json(mapValidationError(customerResult.error));
      return;
    }

    const classification = classifyCustomer(customerResult.data);
    response.status(200).json(mapClassificationResponse(customerResult.data, classification));
  });

  app.get('/openapi.json', (_request, response) => {
    response.status(200).json(openApiDocument);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  const malformedJsonHandler: ErrorRequestHandler = (error, _request, response, next) => {
    if (isMalformedJsonError(error)) {
      response.status(400).json(mapMalformedJsonError());
      return;
    }

    next(error);
  };

  app.use(malformedJsonHandler);

  return app;
}
