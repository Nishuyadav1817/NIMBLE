import { FastifyInstance } from 'fastify'
import {
  buildMediaKey,
  compressImage,
  isAllowedImageMimeType,
  OUTPUT_MIME_TYPE,
} from '../lib/image.js'
import { OwnershipError, assertMediaOwnership } from '../lib/ownership.js'
import prisma from '../lib/prisma.js'
import { buildPublicR2Url, deleteFromR2, uploadToR2 } from '../lib/r2.js'
import { DEFAULT_MAX_FILE_SIZE } from '../plugins/multipart.js'

function imageSettings(fastify: FastifyInstance) {
  return {
    maxFileSize:
      Number.parseInt(fastify.config.IMAGE_MAX_UPLOAD_BYTES, 10) ||
      DEFAULT_MAX_FILE_SIZE,
    maxWidth: Number.parseInt(fastify.config.IMAGE_MAX_WIDTH, 10) || 1920,
    quality: Number.parseInt(fastify.config.IMAGE_WEBP_QUALITY, 10) || 82,
  }
}

export default async function mediaRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/media/upload',
    { preHandler: fastify.requireAuth },
    async (request, reply) => {
      const clerkId = request.clerkId
      if (!clerkId) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      let file
      try {
        file = await request.file()
      } catch (err) {
        const error = err as { code?: string }
        if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
          return reply.code(400).send({ error: 'File size must not exceed 10 MB' })
        }
        throw err
      }

      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' })
      }

      const mimeType = file.mimetype
      if (!isAllowedImageMimeType(mimeType)) {
        return reply.code(400).send({
          error: 'Invalid file type. Allowed types: image/jpeg, image/png, image/webp',
        })
      }

      const buffer = await file.toBuffer()
      const settings = imageSettings(fastify)

      if (buffer.length > settings.maxFileSize) {
        return reply.code(400).send({ error: 'File size must not exceed 10 MB' })
      }

      const compressed = await compressImage(buffer, {
        maxWidth: settings.maxWidth,
        quality: settings.quality,
      })
      const originalFilename = file.filename || 'upload'
      const key = buildMediaKey(originalFilename)
      const publicUrl = buildPublicR2Url(fastify.config.R2_PUBLIC_URL, key)

      await uploadToR2(key, compressed.buffer, OUTPUT_MIME_TYPE)

      const media = await prisma.media.create({
        data: {
          url: publicUrl,
          key,
          filename: originalFilename,
          mimeType: OUTPUT_MIME_TYPE,
          size: compressed.size,
          clerkId,
        },
      })

      return reply.code(201).send({
        id: media.id,
        url: media.url,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        width: compressed.width,
        height: compressed.height,
      })
    },
  )

  fastify.delete(
    '/api/media/:id',
    { preHandler: fastify.requireAuth },
    async (request, reply) => {
      const clerkId = request.clerkId
      if (!clerkId) {
        return reply.code(401).send({ error: 'Unauthorized' })
      }

      const { id } = request.params as { id: string }

      try {
        const media = await assertMediaOwnership(clerkId, id)
        if (media.key) {
          await deleteFromR2(media.key)
        }
        await prisma.media.delete({ where: { id: media.id } })
        return reply.code(204).send()
      } catch (err) {
        if (err instanceof OwnershipError) {
          return reply.code(err.statusCode).send({ error: err.message })
        }
        throw err
      }
    },
  )
}
