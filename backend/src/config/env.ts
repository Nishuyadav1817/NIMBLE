export const schema = {
  type: 'object',
  required: [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_WEBHOOK_SECRET',
    'R2_ENDPOINT',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ],
  properties: {
    PORT: {
      type: 'string',
      default: '3000'
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0'
    },
    DATABASE_URL: { type: 'string' },
    CLERK_SECRET_KEY: { type: 'string' },
    CLERK_PUBLISHABLE_KEY: { type: 'string' },
    CLERK_WEBHOOK_SECRET: { type: 'string' },
    R2_ENDPOINT: { type: 'string' },
    R2_ACCESS_KEY_ID: { type: 'string' },
    R2_SECRET_ACCESS_KEY: { type: 'string' },
    R2_BUCKET: { type: 'string', default: 'nimble-media' },
    R2_PUBLIC_URL: { type: 'string', default: 'https://media.thenimble.in' },
    UPSTASH_REDIS_REST_URL: { type: 'string' },
    UPSTASH_REDIS_REST_TOKEN: { type: 'string' }
  }
}

export interface EnvConfig {
  PORT: string
  HOST: string
  DATABASE_URL: string
  CLERK_SECRET_KEY: string
  CLERK_PUBLISHABLE_KEY: string
  CLERK_WEBHOOK_SECRET: string
  R2_ENDPOINT: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_BUCKET: string
  R2_PUBLIC_URL: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig
  }
}
