import { createApp } from './app';
import { loadEnvironment } from './config/env.schema';
import { logger } from './shared/logger/logger';

const environment = loadEnvironment(process.env);
const app = createApp();

const server = app.listen(environment.PORT, () => {
  logger.info({ port: environment.PORT }, 'HTTP server started');
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'Graceful shutdown requested');

  server.close(() => {
    logger.info('HTTP server stopped');
  });
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => shutdown(signal));
}
