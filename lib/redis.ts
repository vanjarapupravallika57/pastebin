import Redis from 'ioredis';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    // Fallback for local development if not set, or throw error if preferred.
    // For this assignment, we assume REDIS_URL or default local.
    return 'redis://localhost:6379';
};

// Singleton pattern to avoid multiple connections in development
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 1, // Fail fast in dev if not found
        retryStrategy: (times) => {
            if (times > 3) {
                console.warn("Redis connection failed, staying offline (will need fallback).");
                return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
        },
        lazyConnect: true, // Don't connect on import
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Attempt connection immediately but don't crash
redis.on('error', (err) => {
    // Suppress unhandled error log if we are handling it in storage
    // But ioredis still logs.
});
