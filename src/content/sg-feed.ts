import type { SgFeedEntry } from "./types";

/**
 * Seed entries for the Student Government transparency feed.
 *
 * EVERY ROW HERE IS AN EXAMPLE. None of them describes a meeting that
 * happened, a proposal anyone made, or an answer anyone gave. They exist so
 * the page has a shape before officers start filling the spreadsheet, and each
 * one is written to describe the format rather than to imitate real minutes: a
 * fabricated meeting on a transparency page is the worst thing this site could
 * publish, and a realistic-looking fake is worse than an obvious one.
 *
 * `example: true` drives a label on every row and a notice at the top of the
 * page. Do not set it to false on one of these.
 *
 * WHERE THE REAL ENTRIES COME FROM
 * The "Feed" tab of the Google Sheet that already holds the status board. See
 * `fetchSheetFeed` in `src/lib/content.ts` and `doGet` in
 * `scripts/apps-script-store.gs`. The moment that tab has rows, these examples
 * stop rendering entirely: they are a placeholder, not a floor.
 */
export const sgFeed: SgFeedEntry[] = [
  {
    id: "example-meeting",
    kind: "meeting",
    date: "2026-09-10",
    title: "Example of a meeting highlight",
    body: "A real entry names what was discussed, what was decided, and what happens next, in language a student who was not in the room can follow. It does not reproduce the full minutes and it does not name individual students. Replace this with a real meeting.",
    stage: null,
    example: true,
  },
  {
    id: "example-proposal",
    kind: "proposal",
    date: "2026-09-08",
    title: "Example of a policy proposal",
    body: "A real entry says what SG is trying to change, who has to agree to it, and exactly where it has got to. The stage beside it moves as it moves. Passed Senate and Adopted are separate stages on purpose: Senate voting for something is not the same as anything changing. Replace this with a real proposal.",
    stage: "before-senate",
    example: true,
  },
  {
    id: "example-response",
    kind: "response",
    date: "2026-09-05",
    title: "Example of a response to student feedback",
    body: "A real entry restates what students raised, in general terms and never quoting anyone, then gives SG's answer, including when the answer is that SG cannot do it and why. Replace this with a real response.",
    stage: null,
    example: true,
  },
];
