/**
 * Fixed-window rate limiter held in process memory.
 *
 * Good enough for one small site on one instance. It resets on deploy and is
 * not shared between serverless instances, so treat it as friction against
 * casual abuse rather than a real control. Swap in a shared store (Redis,
 * Upstash, a database table) if the site ever gets seriously targeted.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    sweep(now);
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);

  return existing.count > limit
    ? { ok: false, remaining: 0, retryAfterSeconds }
    : { ok: true, remaining: limit - existing.count, retryAfterSeconds };
}

/**
 * Check a bucket without spending from it.
 *
 * Lets a handler reject an over-budget caller up front while only charging the
 * budget for work that actually succeeded.
 */
export function peekRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    return { ok: true, remaining: limit, retryAfterSeconds: 0 };
  }
  const remaining = Math.max(0, limit - existing.count);
  return {
    ok: remaining > 0,
    remaining,
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Drop expired windows so the map cannot grow without bound. */
function sweep(now: number) {
  if (windows.size < 500) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Best-effort client identity from proxy headers. Hashed by the caller before
 * use, so a raw IP address is never written to disk or logged.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
