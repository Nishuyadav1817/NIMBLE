import { verifyToken } from '@clerk/backend'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    clerkId?: string
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'requireAuth',
    async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
      const authHeader = request.headers.authorization

      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Missing or invalid Authorization header' })
      }

      const token = authHeader.slice('Bearer '.length)

      try {
        const payload = await verifyToken(token, {
          secretKey: fastify.config.CLERK_SECRET_KEY,
        })
        const userId = payload?.sub

        if (!userId) {
          return reply.code(401).send({ error: 'Invalid token' })
        }

        request.clerkId = userId
      } catch {
        return reply.code(401).send({ error: 'Invalid or expired token' })
      }
    },
  )
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void | FastifyReply>
  }
}
