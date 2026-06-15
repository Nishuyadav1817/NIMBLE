import { redis } from './redis.js'

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error)
    return null
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  if (!redis) return
  try {
    await redis.set(key, value, { ex: ttlSeconds })
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error)
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`Cache INVALIDATE error for key ${key}:`, error)
  }
}
