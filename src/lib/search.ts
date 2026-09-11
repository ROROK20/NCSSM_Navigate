/**
 * Substring matching for the directory pages.
 *
 * Deliberately not fuzzy. With a few dozen rows, a predictable "does this text
 * contain what I typed" beats a ranking algorithm that surprises people.
 */

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** True when every whitespace-separated term appears somewhere in the haystack. */
export function matchesQuery(haystack: string, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const target = normalize(haystack);
  return terms.every((term) => target.includes(term));
}
