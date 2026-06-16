import { Redis } from '@upstash/redis'

export let redis: Redis | null = null

export function initRedis(url: string, token: string) {
  if (url && token) {
    redis = new Redis({
      url,
      token,
    })
  } else {
    console.warn('Redis credentials missing, caching will be disabled.')
  }
}
