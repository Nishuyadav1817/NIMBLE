import { FastifyInstance } from 'fastify'
import prisma from '../lib/prisma.js'
import { getCache, setCache } from '../lib/cache.js'

export default async function tagsRoutes(app: FastifyInstance) {
  app.get('/api/tags', async (req, reply) => {
    const cacheKey = 'tags:list'
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    await setCache(cacheKey, tags, 900)
    return reply.send(tags)
  })
}
