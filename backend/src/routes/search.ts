import { FastifyInstance } from 'fastify'
import prisma from '../lib/prisma.js'
import { getCache, setCache } from '../lib/cache.js'

export default async function searchRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { q: string } }>('/api/search', async (req, reply) => {
    const { q } = req.query
    if (!q) return reply.send([])

    const cacheKey = `search:${q}`
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    // A basic fallback search since Prisma full text search varies by provider.
    // For robust full text search in PostgreSQL, we'd use raw queries with tsvector,
    // but for now we'll use Prisma's basic string matching to avoid dialect issues.
    const results = await prisma.article.findMany({
      where: {
        published: true,
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: { author: true },
      take: 20
    })

    await setCache(cacheKey, results, 120)
    return reply.send(results)
  })
}
