import type { Media } from '@prisma/client'
import { prisma } from './prisma.js'

export class OwnershipError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'OwnershipError'
    this.statusCode = statusCode
  }
}

/**
 * Verifies the requester owns the media record and returns it.
 * Throws OwnershipError with 404 when missing, 403 when not owned.
 */
export async function assertMediaOwnership(
  clerkId: string,
  mediaId: string,
): Promise<Media> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  })

  if (!media) {
    throw new OwnershipError('Media not found', 404)
  }

  if (media.clerkId !== clerkId) {
    throw new OwnershipError('You do not own this media', 403)
  }

  return media
}
