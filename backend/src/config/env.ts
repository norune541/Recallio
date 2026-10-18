import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    error: "NODE_ENV must be 'development', 'production', or 'test'",
  }),
  PORT: z.coerce
    .number()
    .int('Port must be an integer')
    .positive('Port must be greater than 0'),

  DATABASE_URL: z
    .string()
    .trim()
    .regex(
      /^postgresql:\/\/(?:([^:@\/]+)(?::([^@\/]*))?@)?([^:\/]+)(?::(\d+))?\/([^?]+)(?:\?(.*))?$/,
      { error: 'Invalid DATABASE_URL format' },
    ),

  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .min(1, 'CLERK_PUBLISHABLE_KEY is required'),

  SHOPIFY_CLIENT_ID: z.string().min(1, 'SHOPIFY_CLIENT_ID is required'),
  SHOPIFY_CLIENT_SECRET: z.string().min(1, 'SHOPIFY_CLIENT_SECRET is required'),
  SHOPIFY_SCOPES: z.string().min(1, 'SHOPIFY_SCOPES is required'),
  SHOPIFY_REDIRECT_URL: z.url('SHOPIFY_REDIRECT_URL must be a valid URL'),
  SHOPIFY_API_VERSION: z.string().min(1, 'SHOPIFY_API_VERSION is required'),
  SHOPIFY_TOKEN_ENCRYPTION_KEY: z
    .string()
    .regex(
      /^[a-f0-9]{64}$/i,
      'SHOPIFY_TOKEN_ENCRYPTION_KEY must be a 64-character hex string',
    )
    .min(1, 'SHOPIFY_TOKEN_ENCRYPTION_KEY is required'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment variable validation error:');
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  } else {
    console.error('Unexpected error:', error);
  }
  process.exit(1);
}

export { env };
