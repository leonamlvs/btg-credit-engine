import pino from 'pino';

const isTestEnvironment = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isTestEnvironment ? 'silent' : (process.env.LOG_LEVEL ?? 'info'),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    remove: true,
  },
});
