import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import { schema } from './config/env.js'
import { initR2 } from './lib/r2.js'
import authPlugin from './plugins/auth.js'
import corsPlugin from './plugins/cors.js'
import multipartPlugin from './plugins/multipart.js'
import mediaRoutes from './routes/media.js'
import rootRoutes from './routes/root.js'

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

  // Register CORS
  await app.register(corsPlugin)

  // Register auth and multipart handling
  await app.register(authPlugin)
  await app.register(multipartPlugin)

  // Register Routes
  await app.register(rootRoutes)
  await app.register(mediaRoutes)

  return app
}

export { buildApp }
export type AppInstance = Awaited<ReturnType<typeof buildApp>>
