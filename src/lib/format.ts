/**
 * Date helpers.
 *
 * Everything formats in UTC from a plain `YYYY-MM-DD` string. That keeps server
 * and client output identical, which matters because these strings are rendered
 * during SSR and then hydrated.
 */

const DATE = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

const MONTH = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
});

const DAY = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", day: "numeric" });

function parse(iso: string): Date | null {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = parse(iso);
  return date ? DATE.format(date) : null;
}

export function formatDateShort(iso: string | null | undefined) {
  if (!iso) return null;
  const date = parse(iso);
  return date ? DATE_SHORT.format(date) : null;
}

/** Month + day split, for the date block on the opportunities list. */
export function dateParts(iso: string | null | undefined) {
  if (!iso) return null;
  const date = parse(iso);
  if (!date) return null;
  return { month: MONTH.format(date).toUpperCase(), day: DAY.format(date) };
}

/** Whole days from `from` to `iso`. Negative once the date has passed. */
export function daysUntil(iso: string, from: Date = new Date()) {
  const target = parse(iso);
  if (!target) return null;
  const startOfToday = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  );
  return Math.round((target.getTime() - startOfToday) / 86_400_000);
}

/**
 * Short human label for a countdown. Computed on the server and passed down as
 * a string so the client never re-derives it from a different clock.
 */
export function relativeDayLabel(days: number | null) {
  if (days === null) return null;
  if (days < 0) return days === -1 ? "Yesterday" : `${Math.abs(days)} days ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `In ${days} days`;
  if (days < 60) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

/** YYYY-MM-DD for the current UTC day. Used when stamping `lastVerified`. */
export function todayIso(now: Date = new Date()) {
  return now.toISOString().slice(0, 10);
}
