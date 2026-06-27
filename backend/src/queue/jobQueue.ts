import IORedis from 'ioredis';
import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  // Upstash requires TLS — enabled automatically when the URL is rediss://
  ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
});

export interface DocumentJobData {
  documentId: string;
  userId: string;
  storagePath: string;
  fileName: string;
}

export const documentQueue = new Queue<DocumentJobData>('document-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
