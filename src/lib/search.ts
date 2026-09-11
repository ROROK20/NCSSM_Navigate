/**
 * Matching and ranking for the directory pages.
 *
 * Deliberately not an embedding search and not an LLM. With a few dozen rows,
 * the gap between "what a student types" and "what the row is called" is a
 * vocabulary problem, not a reasoning problem, and vocabulary is solved by
 * giving each row a list of aliases. That stays instant, free, offline, and
 * incapable of inventing a link that does not exist.
 */

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Function words dropped before matching.
 *
 * Every remaining term has to match, which is what keeps results predictable.
 * That rule alone breaks on how people actually type: "my radiator is broken"
 * matched nothing because no row contains "my" or "is". Dropping these makes
 * a sentence behave like the keywords inside it.
 *
 * Only words that are almost never the thing being looked for belong here.
 * "help" and "someone" stay, because they carry meaning on this site.
 */
const STOPWORDS = new Set([
  "i", "im", "me", "my", "mine", "we", "our", "you", "your",
  "a", "an", "the", "some", "any",
  "is", "am", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "doing", "can", "could", "should", "would", "will",
  "to", "for", "of", "in", "on", "at", "by", "from", "into", "with", "about",
  "and", "or", "but", "if", "so", "as", "it", "its",
  "this", "that", "these", "those", "there", "here",
  "where", "what", "when", "who", "how", "why", "which",
  "get", "getting", "got", "need", "needs", "want", "wants",
  "find", "finding", "look", "looking",
  "just", "very", "really", "please", "thanks",
]);

function terms(query: string) {
  const all = normalize(query)
    .replace(/[?!.,;:'"]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const content = all.filter((term) => !STOPWORDS.has(term));
  // A query made entirely of function words carries no intent, so it filters
  // nothing rather than matching nothing.
  return content;
}

/** True when every whitespace-separated term appears somewhere in the haystack. */
export function matchesQuery(haystack: string, query: string) {
  const wanted = terms(query);
  if (wanted.length === 0) return true;
  const target = normalize(haystack);
  return wanted.every((term) => target.includes(term));
}

export interface SearchableFields {
  /** The row's title. A hit here is the strongest signal. */
  name: string;
  /** Words a student might use that do not appear in the title. */
  aliases?: string;
  /** Description, category label, audience, and anything else searchable. */
  body?: string;
}

/**
 * Rank a row against a query.
 *
 * Returns null when any term is missing, so the caller filters and ranks in one
 * pass. Every term must appear somewhere; where it appears decides the weight.
 *
 * Typing "stress" should surface Counseling Services above a row that merely
 * mentions stress in passing, which is what the alias weighting buys.
 */
export function scoreMatch(
  fields: SearchableFields,
  query: string,
): number | null {
  const wanted = terms(query);
  if (wanted.length === 0) return 0;

  const name = normalize(fields.name);
  const aliases = normalize(fields.aliases ?? "");
  const body = normalize(fields.body ?? "");

  let score = 0;
  for (const term of wanted) {
    if (name.includes(term)) {
      // A term starting a word in the title is what someone means when they
      // type a name they half-remember.
      score += startsWord(name, term) ? 6 : 4;
    } else if (aliases.includes(term)) {
      score += 3;
    } else if (body.includes(term)) {
      score += 1;
    } else {
      return null;
    }
  }
  return score;
}

function startsWord(haystack: string, term: string) {
  const index = haystack.indexOf(term);
  return index === 0 || /[\s\-/&(]/.test(haystack[index - 1] ?? "");
}
