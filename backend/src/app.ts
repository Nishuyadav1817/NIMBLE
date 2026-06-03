import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import { schema } from './config/env.js'
import corsPlugin from './plugins/cors.js'
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

  // Register CORS
  await app.register(corsPlugin)

  // Register Routes
  await app.register(rootRoutes)

  return app
}

export { buildApp }
export type AppInstance = Awaited<ReturnType<typeof buildApp>>
