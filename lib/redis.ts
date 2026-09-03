import Redis from 'ioredis';

let redis: Redis | null = null;
let hasLoggedError = false;
let isRedisAvailable = false;

try {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && !redisUrl.includes('placeholder') && !redisUrl.includes('localhost')) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      enableOfflineQueue: false, // JANGAN antrekan kueri jika offline (langsung 0ms fallback)
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times > 1) {
          isRedisAvailable = false;
          return null; // Berhenti mencoba rekoneksi agar tidak memperlambat aplikasi
        }
        return 500;
      },
    });

    redis.on('connect', () => {
      isRedisAvailable = true;
    });

    redis.on('ready', () => {
      isRedisAvailable = true;
    });

    redis.on('error', (err) => {
      isRedisAvailable = false;
      if (!hasLoggedError) {
        console.warn('Redis Bypass Aktif: Menggunakan koneksi langsung database tanpa delay.');
        hasLoggedError = true;
      }
    });

    redis.on('close', () => {
      isRedisAvailable = false;
    });
  }
} catch (error) {
  isRedisAvailable = false;
  if (!hasLoggedError) {
    console.warn('Gagal inisialisasi Redis client. Menggunakan database langsung.');
    hasLoggedError = true;
  }
}

export { redis };

/**
 * Mendapatkan data dari cache Redis (0ms bypass jika offline).
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis || !isRedisAvailable || redis.status !== 'ready') return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    return null; // Fallback instan ke DB
  }
}

/**
 * Menyimpan data ke dalam cache Redis dengan TTL.
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<boolean> {
  if (!redis || !isRedisAvailable || redis.status !== 'ready') return false;
  try {
    const value = JSON.stringify(data);
    await redis.set(key, value, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Menghapus cache berdasarkan kunci tertentu.
 */
export async function invalidateCache(key: string): Promise<boolean> {
  if (!redis || !isRedisAvailable || redis.status !== 'ready') return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Menghapus sekumpulan cache berdasarkan pola pencocokan (misal: 'news:*').
 */
export async function invalidateCachePattern(pattern: string): Promise<boolean> {
  if (!redis || !isRedisAvailable || redis.status !== 'ready') return false;
  try {
    let cursor = '0';
    let keysToDelete: string[] = [];
    
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
    return false;
  }
}

/**
 * Pembatas laju akses (Rate Limiter) berbasis Redis.
 * Jika Redis tidak aktif, rate limiter akan selalu mengizinkan akses (fallback aman).
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = `ratelimit:${identifier}`;
  if (!redis || !isRedisAvailable || redis.status !== 'ready') {
    return { success: true, limit, remaining: limit, reset: 0 };
  }
  
  try {
    const current = await redis.get(key);
    if (!current) {
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
    return { success: true, limit, remaining: limit, reset: 0 }; // Fallback aman
  }
}
