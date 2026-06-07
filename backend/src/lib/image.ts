import sharp from 'sharp'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const OUTPUT_MIME_TYPE = 'image/webp'

export interface CompressionOptions {
  maxWidth: number
  quality: number
}

export interface CompressedImage {
  buffer: Buffer
  width: number
  height: number
  size: number
}

export function isAllowedImageMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export async function compressImage(
  buffer: Buffer,
  options: CompressionOptions,
): Promise<CompressedImage> {
  const { data, info } = await sharp(buffer, {
    animated: false,
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({ width: options.maxWidth, withoutEnlargement: true })
    .webp({ quality: options.quality, effort: 5 })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    size: data.byteLength,
  }
}

export function buildMediaKey(originalFilename: string): string {
  const parsed = path.parse(originalFilename)
  const safeName = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `articles/${Date.now()}-${randomUUID()}-${safeName || 'image'}.webp`
}
