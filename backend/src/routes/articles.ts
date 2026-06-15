import { FastifyInstance } from 'fastify'
import prisma from '../lib/prisma.js'
import { getCache, setCache, invalidateCache } from '../lib/cache.js'
import { checkOwnership } from '../lib/ownership.js'

export default async function articlesRoutes(app: FastifyInstance) {
  app.get('/api/articles', async (req, reply) => {
    const cacheKey = 'articles:list'
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    const articles = await prisma.article.findMany({
      where: { published: true, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      include: { author: true, tags: { include: { tag: true } } }
    })

    await setCache(cacheKey, articles, 300)
    return reply.send(articles)
  })

  app.get('/api/articles/drafts', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId! } })
    if (!user) return reply.status(401).send({ error: 'User not found' })

    const drafts = await prisma.article.findMany({
      where: { authorId: user.id, published: false, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    })
    return reply.send(drafts)
  })

  app.get<{ Params: { slug: string } }>('/api/articles/:slug', async (req, reply) => {
    const { slug } = req.params
    const cacheKey = `article:${slug}`
    const cached = await getCache(cacheKey)
    if (cached) return reply.send(cached)

    const article = await prisma.article.findUnique({
      where: { slug },
      include: { author: true, tags: { include: { tag: true } } }
    })

    if (!article || article.deletedAt) return reply.status(404).send({ error: 'Not found' })
    await setCache(cacheKey, article, 600)
    return reply.send(article)
  })

  app.post<{ Body: { title: string, body: any, excerpt: string, coverImage?: string, tags?: string[] } }>('/api/articles', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId! } })
    if (!user) return reply.status(401).send({ error: 'User not found' })

    const { title, body, excerpt, coverImage, tags } = req.body
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

    const article = await prisma.article.create({
      data: {
        title, slug, body, excerpt, coverImage,
        authorId: user.id,
        tags: tags ? {
          create: tags.map(t => ({
            tag: {
              connectOrCreate: {
                where: { name: t },
                create: { name: t }
              }
            }
          }))
        } : undefined
      }
    })
    await invalidateCache('articles:list')
    return reply.send(article)
  })

  app.patch<{ Params: { id: string }, Body: any }>('/api/articles/:id', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId! } })
    if (!user) return reply.status(401).send({ error: 'User not found' })

    const article = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!article) return reply.status(404).send({ error: 'Not found' })

    if (!checkOwnership(user.id, article.authorId)) return reply.status(403).send({ error: 'Forbidden' })

    const updated = await prisma.article.update({
      where: { id: req.params.id },
      data: req.body as any
    })

    await invalidateCache(`article:${updated.slug}`)
    await invalidateCache('articles:list')
    return reply.send(updated)
  })

  app.post<{ Params: { id: string } }>('/api/articles/:id/publish', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId! } })
    if (!user) return reply.status(401).send({ error: 'User not found' })

    const article = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!article) return reply.status(404).send({ error: 'Not found' })
    if (!checkOwnership(user.id, article.authorId)) return reply.status(403).send({ error: 'Forbidden' })

    const published = await prisma.article.update({
      where: { id: req.params.id },
      data: { published: true, publishedAt: new Date() }
    })

    await invalidateCache(`article:${published.slug}`)
    await invalidateCache('articles:list')
    return reply.send(published)
  })

  app.delete<{ Params: { id: string } }>('/api/articles/:id', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { clerkId: req.clerkId! } })
    if (!user) return reply.status(401).send({ error: 'User not found' })

    const article = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!article) return reply.status(404).send({ error: 'Not found' })
    if (!checkOwnership(user.id, article.authorId)) return reply.status(403).send({ error: 'Forbidden' })

    await prisma.article.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    })

    await invalidateCache(`article:${article.slug}`)
    await invalidateCache('articles:list')
    return reply.send({ success: true })
  })

  app.post<{ Params: { id: string } }>('/api/articles/:id/view', async (req, reply) => {
    await prisma.article.update({
      where: { id: req.params.id },
      data: { readCount: { increment: 1 } }
    }).catch(() => {})
    return reply.send({ success: true })
  })
}
