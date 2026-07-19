import { Redis } from "@upstash/redis";
import { env } from "./env";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({ url: env.upstashRedisUrl!, token: env.upstashRedisToken! });
  }
  return redis;
}

// Fixed-window (not sliding) per-IP-per-hour bucket - simple and good
// enough for a soft cost cap, resets on the clock hour.
function bucketKey(ip: string): string {
  const hourBucket = Math.floor(Date.now() / (60 * 60 * 1000));
  return `whatif:cost:${ip}:${hourBucket}`;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function getSpentCents(ip: string): Promise<number> {
  if (!env.rateLimitEnabled) return 0;
  try {
    const value = await getRedis().get<number>(bucketKey(ip));
    return value ?? 0;
  } catch {
    // Fail open: a Redis outage shouldn't take down the whole app.
    return 0;
  }
}

export async function recordSpentCents(ip: string, cents: number): Promise<void> {
  if (!env.rateLimitEnabled || cents <= 0) return;
  try {
    const key = bucketKey(ip);
    await getRedis().incrbyfloat(key, cents);
    await getRedis().expire(key, 3600);
  } catch {
    // Ignore - losing a cost update just makes the cap slightly soft.
  }
}
