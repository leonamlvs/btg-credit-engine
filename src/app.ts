import { randomUUID } from 'node:crypto';

import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { createOpenApiDocument } from './docs/openapi';
import { logger } from './shared/logger/logger';

export function createApp() {
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

  app.get('/openapi.json', (_request, response) => {
    response.status(200).json(openApiDocument);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  return app;
}
