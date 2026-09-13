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
