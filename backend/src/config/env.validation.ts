import { z } from 'zod';

/**
 * Environment variables validation schema
 * Ensures all required env vars are present and have correct format
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string',
    ),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (secret) => !/^(secret|test|dev|change)/i.test(secret),
      'JWT_SECRET cannot use common weak words like "secret", "test", "dev"',
    ),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((port) => port >= 1000 && port <= 65535, {
      message: 'PORT must be between 1000 and 65535',
    }),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .min(1, 'ALLOWED_ORIGINS is required')
    .refine(
      (origins) => {
        const list = origins.split(',');
        return list.every(
          (origin) =>
            origin.startsWith('http://') ||
            origin.startsWith('https://') ||
            origin === '*',
        );
      },
      'ALLOWED_ORIGINS must be comma-separated valid URLs or "*"',
    ),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables at startup
 * Throws detailed error if validation fails
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(
        `❌ Environment validation failed:\n${issues}\n\nPlease check your .env file.`,
      );
    }
    throw error;
  }
}
