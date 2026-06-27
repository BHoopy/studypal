/**
 * General-purpose Redis client (Upstash via ioredis over TLS).
 *
 * Use this for caching and key-value operations outside BullMQ.
 * BullMQ uses its own dedicated connection from src/queue/jobQueue.ts.
 *
 * Usage:
 *   import { redis } from '../db/redis';
 *   await redis.set('key', 'value', 'EX', 60); // expires in 60 s
 *   const val = await redis.get('key');
 */
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redis = new IORedis(redisUrl, {
  // Upstash requires TLS — automatically enabled for rediss:// URLs
  ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected to Upstash');
});
