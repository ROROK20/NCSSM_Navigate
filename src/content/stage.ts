/**
 * What this site currently is, and what it is allowed to claim.
 *
 * Navigate has two lives.
 *
 * In "demo" it is a candidate's working demonstration. Everything is
 * interactive - the issue form validates, submits, confirms, and the result
 * shows up on the status board - but nothing leaves the visitor's browser.
 * No request reaches the server, nothing is stored, and no officer is
 * notified. The site says so at the point where it would otherwise be
 * mistaken for real: a student who fills in that form is told plainly that it
 * was a demo, because someone with an actual problem will otherwise believe
 * it was filed and wait for help that is not coming.
 *
 * In "official" the same code is the real service.
 *
 * Flipping `current` to "official" is the whole switch:
 *  - the demo marker disappears
 *  - the form posts to the API, which stores submissions for real (the API
 *    checks this too, server-side, so the UI is never the only gate)
 *  - the SG pages replace the proposal pages
 *
 * The resource directory and opportunities board behave identically in both,
 * because neither needs anyone's permission to be useful.
 */

export type Stage = "demo" | "official";

/**
 * The default lives in code so the repository states plainly what the site
 * currently claims to be. `NEXT_PUBLIC_NAVIGATE_STAGE` overrides it, which is
 * what lets the test suite build both positions and lets a host flip the
 * switch without a code change.
 *
 * Anything other than the two known values falls back to "demo": the cautious
 * direction, since a typo must never quietly start collecting student reports.
 */
const configured = process.env.NEXT_PUBLIC_NAVIGATE_STAGE;
const resolved: Stage = configured === "official" ? "official" : "demo";

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
    name: "Rohan Khiani",
    /** The office being sought. Rendered as "running for <office>". */
    office: "Junior Senator",
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
    label: "Student Government",
    /*
     * Used in a sentence, so it reads as a continuation.
     *
     * Deliberately does not describe how SG routes issues internally, because
     * nobody has confirmed that process. Every route named here is one that
     * exists regardless of it. Correct this the moment someone can tell you
     * how reports are actually handled today.
     */
    detail:
      "email sg@ncssm.edu. For anything urgent, or anything involving safety or how you are doing, talk to a counselor, your RLI, or Campus Safety directly — those routes work today and nothing on this site should sit between you and them.",
  },
} as const;

export const isDemo = stage.current === "demo";

/**
 * Whether a submission may reach the server and be stored.
 *
 * False in demo: the form still works, but it writes to the visitor's own
 * browser instead of posting. The API route checks this independently, so a
 * stray request cannot store anything even if the UI is wrong.
 */
export const acceptsSubmissions = stage.current === "official";

/** How the site refers to itself when it cannot claim to be SG. */
export const proposalLabel = stage.candidate.name
  ? `A proposal by ${stage.candidate.name}`
  : "A student proposal";
