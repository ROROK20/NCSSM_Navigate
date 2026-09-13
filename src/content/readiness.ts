import type { StatusTone } from "@/components/ui";

/**
 * What each part of Navigate actually is today.
 *
 * The site has outgrown a single demo/official switch. Some pages are finished
 * and carrying real data; some are finished and waiting for data nobody has
 * collected; one shows labelled examples; and two work end to end but store
 * nothing until Student Government adopts them. Calling all of that "a demo"
 * undersells the working parts, and calling it all "live" would be a lie.
 *
 * So each surface says which of the four it is, in the same words everywhere:
 * on the homepage, on the page itself, and in the list on the proposal page.
 * One table, so those three can never drift apart and quietly overclaim.
 *
 * This is separate from `stage.ts` on purpose. That file answers one question
 * - may this site claim to be Student Government, and may it store a report -
 * and it is wired into the API and the tests. This answers a different one:
 * what is a visitor actually looking at.
 */
export type ReadinessState = "live" | "collecting" | "examples" | "demo";

export interface Readiness {
  state: ReadinessState;
  /** The at-a-glance label. Short enough to sit beside a heading. */
  label: string;
  /** The specific caveat for this surface, where one is needed. */
  note?: string;
  tone: StatusTone;
}

const STATES: Record<ReadinessState, Omit<Readiness, "note">> = {
  live: {
    state: "live",
    label: "Working now",
    tone: "done",
  },
  collecting: {
    state: "collecting",
    label: "Needs data",
    tone: "info",
  },
  examples: {
    state: "examples",
    label: "Examples only",
    tone: "warn",
  },
  demo: {
    state: "demo",
    label: "Demo only",
    tone: "active",
  },
};

/** What each state means, for the legend on the proposal page. */
export const READINESS_LEGEND: Array<Readiness & { description: string }> = [
  {
    ...STATES.live,
    description:
      "Finished, carrying real data, useful today. Nothing has to happen for this to work.",
  },
  {
    ...STATES.collecting,
    description:
      "Finished and searchable, but nobody has collected the entries yet. It shows an empty page rather than invented ones.",
  },
  {
    ...STATES.examples,
    description:
      "Finished, showing clearly labelled examples so you can see the shape. Officers replace them from a spreadsheet.",
  },
  {
    ...STATES.demo,
    description:
      "Works end to end, but nothing is stored and nobody is notified. This is the part that needs the office.",
  },
];

/**
 * Keyed by route. A route missing from here renders no tag at all, which is
 * the right default: a page nobody has judged should not claim a status.
 */
export const READINESS: Record<string, Readiness> = {
  "/resources": {
    ...STATES.live,
    note: "212 entries, every link machine-checked. Nobody has confirmed each one is the best page for what it promises.",
  },
  "/academic-help": {
    ...STATES.live,
    note: "Every route here is an existing NCSSM page, grouped by the subject its link actually serves.",
  },
  "/opportunities": {
    ...STATES.live,
    note: "Real programmes with real links. Dates and costs change, so check with the organiser.",
  },
  "/discounts": {
    ...STATES.live,
    note: "The seven businesses are real and confirmed. What each discount is has not been confirmed by anyone.",
  },
  "/amenities": {
    ...STATES.collecting,
    note: "Nobody has walked the buildings yet. Guessing a room number would send someone to the wrong floor.",
  },
  "/clubs": {
    ...STATES.collecting,
    note: "Student Government charters the clubs and publishes the list. Nothing is copied here until it can be kept current.",
  },
  "/transparency": {
    ...STATES.examples,
    note: "No meeting below took place. Officers replace these from a spreadsheet tab, and the examples disappear on the first real row.",
  },
  "/report": {
    ...STATES.demo,
    note: "The form validates, submits, and confirms. Nothing leaves your browser, because a report needs an office behind it.",
  },
  "/updates": {
    ...STATES.demo,
    note: "The tracker works. The entries on it are examples, because no real report has been filed through a site nobody has adopted.",
  },
  "/admin": {
    ...STATES.live,
    note: "Officers edit links and post updates from a password-protected page. Handing it over is a password, not a tutorial.",
  },
};

export function readinessOf(href: string): Readiness | undefined {
  return READINESS[href];
}
