import { FastifyInstance } from 'fastify'

export default async function rootRoutes(fastify: FastifyInstance) {
  fastify.get('/ping', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Hello from Nimble Backend!',
    }
  })
}
