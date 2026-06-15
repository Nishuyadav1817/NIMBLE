import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import { schema } from './config/env.js'
import { initR2 } from './lib/r2.js'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyHelmet from '@fastify/helmet'
import { initRedis } from './lib/redis.js'
import authPlugin from './plugins/auth.js'
import corsPlugin from './plugins/cors.js'
import multipartPlugin from './plugins/multipart.js'
import mediaRoutes from './routes/media.js'
import rootRoutes from './routes/root.js'
import webhookRoutes from './routes/webhooks.js'
import articlesRoutes from './routes/articles.js'
import tagsRoutes from './routes/tags.js'
import searchRoutes from './routes/search.js'

async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  // Load and validate environment variables
  await app.register(fastifyEnv, {
    schema,
    dotenv: true, // Auto-loads from .env if present
  })

  initR2({
    R2_ENDPOINT: app.config.R2_ENDPOINT,
    R2_ACCESS_KEY_ID: app.config.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: app.config.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: app.config.R2_BUCKET,
  })

  initRedis(app.config.UPSTASH_REDIS_REST_URL, app.config.UPSTASH_REDIS_REST_TOKEN)

  // Security Headers
  await app.register(fastifyHelmet)

  // Register CORS
  await app.register(corsPlugin)

  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: 100, // default limit
    timeWindow: '1 minute'
  })

  // Register auth and multipart handling
  await app.register(authPlugin)
  await app.register(multipartPlugin)

  // Register Routes
  await app.register(rootRoutes)
  await app.register(mediaRoutes)
  await app.register(webhookRoutes)
  await app.register(articlesRoutes)
  await app.register(tagsRoutes)
  await app.register(searchRoutes)

  return app
}

export { buildApp }
export type AppInstance = Awaited<ReturnType<typeof buildApp>>
