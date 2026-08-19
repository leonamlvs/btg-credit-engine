import { z } from 'zod';

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function loadEnvironment(source: NodeJS.ProcessEnv): Environment {
  const result = EnvironmentSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${result.error.message}`);
  }

  return result.data;
}
