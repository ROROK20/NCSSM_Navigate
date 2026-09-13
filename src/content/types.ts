/**
 * Core content types for NCSSM Navigate.
 *
 * Everything the site renders is described here. Seed data lives in
 * `src/content/*.ts` and is the single place to edit content today; the shapes
 * below are deliberately database-friendly so the same records can move into a
 * table later without touching the UI.
 */

import type {
  ResourceCategoryId,
  DiscountCategoryId,
  AmenityCategoryId,
  ClubCategoryId,
  SgFeedKindId,
  SgProposalStageId,
  OpportunityCategoryId,
  IssueCategoryId,
  IssueStatusId,
  PlatformId,
} from "./taxonomy";

/**
 * How much we trust the link right now.
 * - `verified`   an editor opened the link and confirmed it works.
 * - `needs-review` seed/imported data nobody has confirmed yet.
 * - `outdated`   known broken or superseded; shown with a warning.
 */
export type VerificationStatus = "verified" | "needs-review" | "outdated";

/**
 * One serving window or opening window.
 *
 * Deliberately flat rather than nested by day, because this is the shape a
 * spreadsheet holds: one line per window, the day group repeated. Anything
 * nested would have to be flattened again for the CSV round-trip, and the
 * flattening is where a schedule silently loses a row.
 *
 * `time` is free text so "Closed", "24 hours", and "By appointment" all work
 * without a second field to say which kind of value this is.
 */
export interface HoursRow {
  /** "Monday to Friday", "Saturday and Sunday", "Every day". */
  days: string;
  /** "Breakfast", "Lunch", "Dinner". Empty when there is one window a day. */
  period: string;
  /** "7:45am - 10:00am". */
  time: string;
}

export interface Resource {
  id: string;
  name: string;
  /** One or two sentences. Plain language, no jargon. */
  description: string;
  category: ResourceCategoryId;
  /** The canonical destination. Always the school's own URL, never a mirror. */
  officialUrl: string;
  /** Who this is for, e.g. "Residential students" or "Juniors and seniors". */
  audience?: string;
  /**
   * Words a student would actually type that do not appear in `name` or
   * `description`: "stressed", "broken dryer", "rec letter".
   *
   * Never rendered. This exists so search finds the row, and it is the reason
   * the site does not need an AI layer to answer "who do I talk to about X".
   */
  aliases?: string;
  /** Public office/department contact. Never an individual student. */
  contactEmail?: string;
  contactNote?: string;
  /**
   * Opening or serving hours, when a student's actual question is "is it open
   * right now" rather than "where is the page".
   *
   * `verificationStatus` covers this too: a link checker can prove the page
   * resolves, and proves nothing about whether breakfast still ends at ten, so
   * hours on an unverified row are labelled unconfirmed in the UI.
   */
  hours?: HoursRow[];
  /**
   * True when the link lands on a system that requires an NCSSM account.
   * We only ever link out; we never proxy or store content behind these.
   */
  loginRequired: boolean;
  /** The system the link goes to, so students know what to expect. */
  platform: PlatformId;
  /** ISO date (YYYY-MM-DD) an editor last confirmed the link. */
  lastVerified: string | null;
  verificationStatus: VerificationStatus;
  /** Surfaced on the homepage. Keep this to a handful. */
  featured?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: OpportunityCategoryId;
  /** ISO date of the event, or of the deadline when `dateKind` is "deadline". */
  date: string | null;
  dateKind: "event" | "deadline" | "rolling";
  /** Human-readable end date for multi-day events. */
  endDate?: string | null;
  location: string;
  /** Free text so "Free", "$15", "Free with student ID" all work. */
  cost: string;
  eligibility: string;
  registrationUrl: string | null;
  /** Where we found it, so students can judge it themselves. */
  source: string;
  sourceUrl?: string | null;
  /** An editor confirmed the details. Unverified items are labelled in the UI. */
  verified: boolean;
  featured?: boolean;
}

/**
 * A Durham business that gives NCSSM students a discount.
 *
 * The honesty problem this shape exists to solve: the NAMES came from the SG
 * discounts committee and the TERMS did not. Nobody has said what each deal is
 * or whether a student ID is needed.
 *
 * So `terms` is a string that is allowed to be empty and `studentIdRequired` is
 * allowed to be null, and both render as "not confirmed" rather than as a
 * blank. A student refused at a counter because this site promised ten percent
 * is a worse outcome than no listing at all, and a field that can only hold a
 * value quietly invites someone to invent one.
 */
export interface StudentDiscount {
  id: string;
  /** The business name as the committee supplied it. */
  name: string;
  /**
   * What it sells, in a few words.
   *
   * Confirmed against the business's own listing rather than supplied by the
   * committee, which is a weaker source than the name but a much cheaper
   * mistake: a student who walks to a tea house expecting tea has lost nothing.
   */
  kind: string;
  category: DiscountCategoryId;
  /**
   * What the discount actually is.
   *
   * EMPTY until the committee says. Never fill this from a guess, a review
   * site, or another school's list.
   */
  terms: string;
  /** null means nobody has said either way. Not the same as false. */
  studentIdRequired: boolean | null;
  /**
   * The business's own site, where it has one.
   *
   * Empty is the normal case, not a gap to fill: Google Maps already carries
   * hours, phone and photos, so this earns its place only by going somewhere
   * Maps does not, which in practice means a menu. Add a URL only after
   * opening it and seeing this business's own address on the page. `npm run
   * check:links` covers these, so a dead one fails rather than rots.
   */
  website?: string;
  /**
   * Overrides the Google Maps query when the supplied name is ambiguous.
   *
   * Empty for a name that already resolves to the right place. There is no
   * stored URL anywhere in this record on purpose: the map link is derived
   * from the name, so it cannot drift out of date or be quietly invented.
   */
  mapsQuery?: string;
  /** Words a student would type. "boba", "late night", "cheap food". */
  aliases?: string;
}

/**
 * A physical thing on campus: a printer, a refill station, a microwave.
 *
 * WHY THIS IS NOT A `Resource`.
 *
 * `Resource` requires `officialUrl`, `platform`, `loginRequired` and
 * `verificationStatus`. Every one of those describes a web destination, and
 * an amenity has none: it has a building and a floor. Making `officialUrl`
 * optional to fit would cost two things worth more than the saved type. The
 * link checker's guarantee that every resource row is a URL it can test would
 * become "every row except the ones that are not", and the directory UI would
 * grow a no-URL branch through the title, the platform rail and the login chip
 * for rows that are not resources at all.
 *
 * The parts worth sharing are shared anyway: the same `aliases` field, the
 * same `scoreMatch`, the same `FilterBar`. What differs is the payload, and
 * that is exactly what a separate type is for.
 *
 * A wrong row here costs a student a walk to the third floor for a printer
 * that is not there, so `lastChecked` records when somebody last stood in
 * front of the thing, and null - nobody ever has - is shown, not hidden.
 */
export interface Amenity {
  id: string;
  /** What it is, as a student would point at it: "Colour printer". */
  name: string;
  category: AmenityCategoryId;
  /** Building name as it appears on campus signage. */
  building: string;
  /** "2nd floor", "Ground floor". Empty when the building has one level. */
  floor: string;
  /** Room number, or the landmark you walk to: "the lounge past the stairwell". */
  place: string;
  /** Anything that changes the trip: "takes card only", "out of order". */
  notes: string;
  /** Words a student would type: "print in colour", "fill my water bottle". */
  aliases?: string;
  /** ISO date somebody last confirmed it in person. null means nobody has. */
  lastChecked: string | null;
}

/**
 * A student club.
 *
 * `does` carries the weight here. Nobody searches for "Mu Alpha Theta"; they
 * search for "math competitions", and a name-only search would answer that
 * with nothing. So `does` is scored as an alias rather than as body text, and
 * it should be written as what a member actually does on a Tuesday evening,
 * not as a mission statement.
 *
 * `contactEmail` should be a club address wherever one exists. A student's own
 * address published on a public page is a privacy decision that belongs to
 * that student, so only put one here if they have said yes. Officers change
 * every year; the inbox does not.
 *
 * `instagram` is the handle alone, with no @ and no URL. The link is built
 * from it at render time, so there is no address in the content file to mistype.
 */
export interface Club {
  id: string;
  name: string;
  /** What members actually do. The thing search has to match. */
  does: string;
  category: ClubCategoryId;
  /** "Weekly", "Every other week", "Varies". Free text. */
  frequency: string;
  /** "Tuesdays, 7pm". Free text so "varies by term" works. */
  meets: string;
  location: string;
  /** Prefer a club address. See the note above before using a person's. */
  contactEmail: string;
  /** Handle only: "ncssmchess", not "@ncssmchess" and not a URL. */
  instagram: string;
  /** Words a student would type that are not in the name or in `does`. */
  aliases?: string;
}

export interface SgUpdate {
  id: string;
  /**
   * A generalized title. Never a student's words, never identifying.
   * Written by SG, not copied from a submission.
   */
  title: string;
  category: IssueCategoryId;
  status: IssueStatusId;
  /** ISO date this entry was last touched. */
  dateUpdated: string;
  /** Sanitized, public-safe summary. Reviewed before publishing. */
  summary: string;
  nextStep?: string | null;
}

/**
 * One entry in the Student Government transparency feed.
 *
 * NOT the same thing as an SgUpdate. An SgUpdate follows a problem a student
 * reported, through stages, to a resolution. This follows Student Government
 * itself: what was discussed at a meeting, what it is trying to change, and
 * what it said back when students raised something.
 *
 * The two boards are separate because they answer different questions. "Is
 * anyone doing anything about the dryers" and "what did SG actually do this
 * week" are not the same question, and one board answering both ends up
 * answering neither.
 *
 * Officers maintain this in a spreadsheet, not in TypeScript. See
 * `fetchSheetFeed` in `src/lib/content.ts`.
 */
export interface SgFeedEntry {
  id: string;
  kind: SgFeedKindId;
  /** ISO date of the meeting, or of the last movement on a proposal. */
  date: string;
  title: string;
  /** The substance, in language a student who was not there can follow. */
  body: string;
  /** Only meaningful when `kind` is "proposal". Null otherwise. */
  stage: SgProposalStageId | null;
  /**
   * True when this row is a shipped example rather than something that
   * happened.
   *
   * Every seed row sets it. The UI labels those rows and says so at the top of
   * the page, because a fabricated meeting on a transparency page is the worst
   * thing this site could publish.
   */
  example: boolean;
}

export interface SgDocument {
  id: string;
  title: string;
  description?: string;
  url: string;
  /** `public` renders a link. `internal` renders a labelled, non-linked row. */
  access: "public" | "internal";
  loginRequired: boolean;
  updated?: string | null;
}

/**
 * A submitted issue. This shape is never rendered on a public page.
 * `src/lib/submissions.ts` is the only module that reads or writes it.
 */
export interface IssueSubmission {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  category: IssueCategoryId;
  /** Free-text spot on campus, e.g. "Bryan 3rd floor" or "Dining hall". */
  location: string | null;
  /** Null whenever the student chose to stay anonymous. */
  contact: string | null;
  anonymous: boolean;
  /** Internal triage state. Not the same as the public SgUpdate status. */
  triage: "new" | "reviewed" | "published" | "closed";
}
