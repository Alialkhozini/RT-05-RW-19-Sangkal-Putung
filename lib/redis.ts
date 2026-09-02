import Redis from 'ioredis';

let redis: Redis | null = null;
let hasLoggedError = false;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      reconnectOnError: () => false,
    });
  } else if (process.env.REDIS_HOST) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      username: process.env.REDIS_USERNAME || undefined,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      reconnectOnError: () => false,
    });
  }

  if (redis) {
    redis.on('error', (err) => {
      if (!hasLoggedError) {
        console.warn('Redis Connection Error (Fallback active): Connection failed. App is running with database direct queries.');
        hasLoggedError = true;
      }
    });
  }
} catch (error) {
  if (!hasLoggedError) {
    console.warn('Failed to initialize Redis client. Falling back to direct database query:', error);
    hasLoggedError = true;
  }
}

export { redis };

/**
 * Mendapatkan data dari cache Redis.
 * @param key Kunci cache.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Redis getCache error for key ${key}:`, error);
    return null; // Fallback ke DB
  }
}

/**
 * Menyimpan data ke dalam cache Redis dengan TTL.
 * @param key Kunci cache.
 * @param data Data yang ingin disimpan (akan di-stringify otomatis).
 * @param ttlSeconds Masa aktif cache dalam detik.
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<boolean> {
  if (!redis) return false;
  try {
    const value = JSON.stringify(data);
    await redis.set(key, value, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    console.error(`Redis setCache error for key ${key}:`, error);
    return false;
  }
}

/**
 * Menghapus cache berdasarkan kunci tertentu.
 * @param key Kunci cache.
 */
export async function invalidateCache(key: string): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis invalidateCache error for key ${key}:`, error);
    return false;
  }
}

/**
 * Menghapus sekumpulan cache berdasarkan pola pencocokan (misal: 'news:*').
 * @param pattern Pola pencarian cache.
 */
export async function invalidateCachePattern(pattern: string): Promise<boolean> {
  if (!redis) return false;
  try {
    let cursor = '0';
    let keysToDelete: string[] = [];
    
    // Scan menggunakan batch kecil agar tidak memblokir server Redis
    do {
      const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      keysToDelete = keysToDelete.concat(reply[1]);
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
    return true;
  } catch (error) {
    console.error(`Redis invalidateCachePattern error for pattern ${pattern}:`, error);
    return false;
  }
}

/**
 * Pembatas laju akses (Rate Limiter) berbasis Redis.
 * Jika Redis tidak aktif, rate limiter akan selalu mengizinkan akses (fallback aman).
 * @param identifier Pengenal unik (misal: Alamat IP + Endpoint).
 * @param limit Jumlah maksimal request dalam jendela waktu.
 * @param windowSeconds Durasi jendela waktu dalam detik.
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  if (!redis) {
    return { success: true, limit, remaining: limit, reset: 0 };
  }
  
  try {
    const current = await redis.get(key);
    if (!current) {
      // Request pertama
      await redis.set(key, '1', 'EX', windowSeconds);
      return { success: true, limit, remaining: limit - 1, reset: windowSeconds };
    }
    
    const count = parseInt(current);
    if (count >= limit) {
      const ttl = await redis.ttl(key);
      return { success: false, limit, remaining: 0, reset: ttl > 0 ? ttl : windowSeconds };
    }
    
    await redis.incr(key);
    const ttl = await redis.ttl(key);
    return { success: true, limit, remaining: limit - count - 1, reset: ttl > 0 ? ttl : windowSeconds };
  } catch (error) {
    console.error(`Redis rateLimit error for ${identifier}:`, error);
    return { success: true, limit, remaining: limit, reset: 0 }; // Fallback aman
  }
}
