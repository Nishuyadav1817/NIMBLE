import { FastifyInstance } from 'fastify'
import { Webhook } from 'svix'
import prisma from '../lib/prisma.js'

export default async function webhookRoutes(app: FastifyInstance) {
  // We need the raw body for Svix signature verification. Fastify can provide it as string if we set it up,
  // or we can just stringify the parsed body, but the safest is getting the raw payload.
  // For simplicity, we assume req.body is parsed and we stringify it.
  app.post('/api/webhooks/clerk', async (req, reply) => {
    const WEBHOOK_SECRET = app.config.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    const svix_id = req.headers['svix-id'] as string
    const svix_timestamp = req.headers['svix-timestamp'] as string
    const svix_signature = req.headers['svix-signature'] as string

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return reply.status(400).send({ error: 'Error occured -- no svix headers' })
    }

    // Get the body
    const payload = JSON.stringify(req.body)
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: any
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err: any) {
      app.log.error('Error verifying webhook:', err.message)
      return reply.status(400).send({ error: 'Error verifying webhook' })
    }

    const { id } = evt.data
    const eventType = evt.type

    if (eventType === 'user.created') {
      const email = evt.data.email_addresses?.[0]?.email_address || ''
      const name = `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim() || 'Anonymous'
      const avatar = evt.data.image_url || null

      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name,
          avatar
        }
      })
      app.log.info(`User created in DB: ${id}`)
    }

    return reply.status(200).send({ success: true })
  })
}
