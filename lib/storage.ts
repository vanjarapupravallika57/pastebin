import { redis } from './redis';
import { nanoid } from 'nanoid';

export interface Paste {
    id: string;
    content: string;
    expires_at: number | null; // Unix timestamp in ms
    remaining_views: number | null;
}

// In-Memory Fallback Store (Global for dev mode persistence)
const globalForStore = global as unknown as { memoryStore: Map<string, any> };
const memoryStore = globalForStore.memoryStore || new Map<string, any>();
if (process.env.NODE_ENV !== 'production') globalForStore.memoryStore = memoryStore;

async function isRedisAvailable(): Promise<boolean> {
    if (process.env.FORCE_MEMORY_MODE === '1') return false;
    try {
        if (redis.status === 'ready') return true;
        if (redis.status === 'wait') {
            // Try simple ping
            await redis.ping();
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export async function createPaste(
    content: string,
    ttlSeconds?: number,
    maxViews?: number
): Promise<{ id: string; url: string }> {
    const id = nanoid(10);
    const key = `paste:${id}`;

    const pasteData: Record<string, any> = {
        content,
        created_at: Date.now(),
    };

    if (maxViews !== undefined && maxViews !== null) {
        pasteData.remaining_views = maxViews;
    }

    if (ttlSeconds !== undefined && ttlSeconds !== null) {
        pasteData.expires_at = Date.now() + ttlSeconds * 1000;
    }

    // Dual Write Logic (Try Redis, Fallback to Memory)
    // Check if redis is responsive
    if (await isRedisAvailable()) {
        await redis.hset(key, pasteData);
        if (ttlSeconds) {
            await redis.expire(key, ttlSeconds + 86400);
        }
    } else {
        console.warn('Using In-Memory Store for', key);
        memoryStore.set(key, pasteData);
    }

    return { id, url: `/p/${id}` };
}

export async function getPaste(id: string, customNow?: number): Promise<Paste | null> {
    const key = `paste:${id}`;
    const now = customNow ?? Date.now();

    if (await isRedisAvailable()) {
        return getPasteRedis(key, now, id);
    } else {
        return getPasteMemory(key, now, id);
    }
}

async function getPasteRedis(key: string, now: number, id: string): Promise<Paste | null> {
    const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    
    -- Check if key exists
    if redis.call("EXISTS", key) == 0 then
      return nil
    end
    
    local expires_at = redis.call("HGET", key, "expires_at")
    local remaining_views = redis.call("HGET", key, "remaining_views")
    local content = redis.call("HGET", key, "content")
    
    -- Check Expiry
    if expires_at ~= false and tonumber(expires_at) < now then
       return nil
    end
    
    -- Check View Count
    if remaining_views ~= false then
       local views = tonumber(remaining_views)
       if views <= 0 then
         return nil
       end
       -- Decrement
       redis.call("HINCRBY", key, "remaining_views", -1)
       -- Refresh remaining_views for return
       remaining_views = views - 1
    end
    
    return { content, expires_at, remaining_views }
  `;

    try {
        const result = await redis.eval(script, 1, key, now) as [string, string | null, number | null] | null;

        if (!result) return null;

        const [content, expiresAtStr, remainingViews] = result;

        return {
            id,
            content,
            expires_at: expiresAtStr ? parseInt(expiresAtStr) : null,
            remaining_views: remainingViews
        };
    } catch (err) {
        console.error("Redis Eval Error", err);
        // Fallback to memory if redis fails mid-flight? No, that's risky.
        return null;
    }
}

function getPasteMemory(key: string, now: number, id: string): Paste | null {
    const data = memoryStore.get(key);
    if (!data) return null;

    // Check Expiry
    if (data.expires_at && data.expires_at < now) {
        return null;
    }

    // Check View Count
    let remaining_views = null;
    if (data.remaining_views !== undefined && data.remaining_views !== null) {
        if (data.remaining_views <= 0) {
            return null;
        }
        // Decrement
        data.remaining_views -= 1;
        remaining_views = data.remaining_views;
    }

    return {
        id,
        content: data.content,
        expires_at: data.expires_at || null,
        remaining_views: remaining_views
    };
}

export async function getPasteViewOnly(id: string): Promise<Omit<Paste, 'remaining_views'> | null> {
    return getPaste(id);
}
