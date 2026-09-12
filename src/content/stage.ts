/**
 * What this site currently is, and what it is allowed to claim.
 *
 * Navigate has two lives. While it is a candidate's proposal it must not look
 * or behave like an official Student Government service: it cannot collect
 * student issue reports, because nobody is empowered to act on them, and it
 * cannot present itself as SG, because it is not.
 *
 * Once SG actually adopts it, the same code becomes the real thing.
 *
 * Flipping `current` to "official" is the whole switch:
 *  - the proposal banner disappears
 *  - the issue form starts accepting submissions (the API checks this too,
 *    server-side, so the UI is never the only gate)
 *  - the SG pages replace the proposal pages
 *
 * Everything else on the site - the resource directory, the opportunities
 * board - works identically in both stages, because neither needs anyone's
 * permission to be useful.
 */

export type Stage = "proposal" | "official";

/**
 * The default lives in code so the repository states plainly what the site
 * currently claims to be. `NEXT_PUBLIC_NAVIGATE_STAGE` overrides it, which is
 * what lets the test suite build both positions and lets a host flip the
 * switch without a code change.
 *
 * Anything other than the two known values falls back to "proposal": the
 * cautious direction, since a typo must never quietly start collecting
 * student reports.
 */
const configured = process.env.NEXT_PUBLIC_NAVIGATE_STAGE;
const resolved: Stage = configured === "official" ? "official" : "proposal";

export const stage = {
  current: resolved,

  /**
   * Who is proposing this. Shown in the banner and on the proposal page.
   *
   * Leave `name` empty and the site describes itself as a student proposal
   * without attributing it to anyone - which is correct until someone decides
   * to put their name on it. Fill it in to campaign with it.
   */
  candidate: {
    name: "",
    /** The office being sought, e.g. "Student Body President". */
    office: "Student Government",
    /** Free text, e.g. "this spring". Used in a sentence, so keep it short. */
    term: "next year",
  },

  /**
   * Where a student should actually go today for the things Navigate cannot
   * yet handle. This must point at whoever really holds the job right now.
   *
   * SEED VALUE - replace before sharing the link with anyone.
   */
  currentRoute: {
    label: "the current Student Government",
    detail:
      "Talk to a current SG officer, your RLI, or the relevant office directly.",
  },
} as const;

export const isProposal = stage.current === "proposal";

/**
 * The single source of truth for whether the site may take a submission.
 *
 * Read by the API route before anything is stored, and by the form before it
 * renders. Never gate this in the UI alone.
 */
export const acceptsSubmissions = stage.current === "official";

/** How the site refers to itself when it cannot claim to be SG. */
export const proposalLabel = stage.candidate.name
  ? `A proposal by ${stage.candidate.name}`
  : "A student proposal";
