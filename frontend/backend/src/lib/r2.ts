import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { EnvConfig } from '../config/env.js'

let s3Client: S3Client | null = null
let bucket = ''

export const ARTICLE_IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

export function initR2(config: Pick<
  EnvConfig,
  'R2_ENDPOINT' | 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY' | 'R2_BUCKET'
>) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  })
  bucket = config.R2_BUCKET
}

function getClient(): S3Client {
  if (!s3Client) {
    throw new Error('R2 client not initialized. Call initR2() during app startup.')
  }
  return s3Client
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: ARTICLE_IMAGE_CACHE_CONTROL,
    }),
  )
}

export async function deleteFromR2(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}

export function buildPublicR2Url(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/+$/, '')}/${key}`
}
