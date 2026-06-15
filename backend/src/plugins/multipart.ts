import multipart from '@fastify/multipart'
import { FastifyInstance } from 'fastify'

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024

export default async function multipartPlugin(fastify: FastifyInstance) {
  const maxFileSize = Number.parseInt(
    fastify.config.IMAGE_MAX_UPLOAD_BYTES,
    10,
  ) || DEFAULT_MAX_FILE_SIZE

  await fastify.register(multipart, {
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
  })
}

export { DEFAULT_MAX_FILE_SIZE }
