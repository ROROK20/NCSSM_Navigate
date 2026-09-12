import "server-only";

/**
 * The site's absolute public origin, for canonical URLs, the sitemap, robots,
 * and social cards.
 *
 * Lives here rather than in `content/site.ts` because that module is imported
 * by client components. Host variables like VERCEL_PROJECT_PRODUCTION_URL are
 * server-only, so reading them from a client-reachable module would inline
 * `undefined` into the browser bundle and give the two renders different
 * values.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL   - an explicit override always wins
 *  2. VERCEL_PROJECT_PRODUCTION_URL - the stable production domain, set by
 *     Vercel itself, so a first deploy is correct with nothing configured
 *  3. http://localhost:3000  - local development
 *
 * Every candidate is normalised and validated. An unusable value falls through
 * to the next rather than throwing: a malformed environment variable must not
 * be able to fail the build, which is exactly what it did before this existed.
 */

const FALLBACK = "http://localhost:3000";

function normalize(value: string | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  // An empty or whitespace-only variable is the common case on a host where
  // someone created the key without a value. `??` does not catch it.
  if (trimmed.length === 0) return null;

  // Vercel supplies a bare hostname, and people routinely paste one too.
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Trailing slashes double up when these are concatenated with a path.
    return url.origin;
  } catch {
    return null;
  }
}

function resolve(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    if (normalized) return normalized;
  }

  return FALLBACK;
}

export const siteUrl = resolve();
