/**
 * Every controlled vocabulary the site uses.
 *
 * Adding a category means adding one entry here; the filters, tags, counts and
 * form dropdowns all read from these arrays, so nothing else needs editing.
 */

/* ---------------------------------------------------------------- platform */

/** The system a resource link lands on. Drives the "login required" copy. */
export const PLATFORMS = [
  { id: "web", label: "Public website" },
  { id: "blackbaud", label: "Blackbaud" },
  { id: "canvas", label: "Canvas" },
  { id: "google", label: "Google Workspace" },
  { id: "email", label: "Email" },
  { id: "form", label: "Online form" },
  { id: "phone", label: "Phone" },
  { id: "other", label: "Other" },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

/* -------------------------------------------------------- resource buckets */

/**
 * `tone` maps to a category dot colour defined in globals.css. Keep the set
 * small; these are wayfinding marks, not decoration.
 */
export const RESOURCE_CATEGORIES = [
  {
    id: "urgent-support",
    label: "Urgent support",
    blurb: "If you need help right now.",
    tone: "alert",
  },
  {
    id: "academic-support",
    label: "Academic support",
    blurb: "Tutoring, writing help, study resources.",
    tone: "one",
  },
  {
    id: "advising-counseling",
    label: "Advising & counseling",
    blurb: "Counselors, college advising, wellbeing.",
    tone: "two",
  },
  {
    id: "residential-life",
    label: "Residential life",
    blurb: "Dorms, RLAs, check-in and check-out.",
    tone: "three",
  },
  {
    id: "dining-transportation",
    label: "Dining & transportation",
    blurb: "Meals, menus, buses, travel home.",
    tone: "four",
  },
  {
    id: "technology",
    label: "Technology",
    blurb: "Accounts, wifi, devices, help desk.",
    tone: "five",
  },
  {
    id: "forms",
    label: "Important forms",
    blurb: "The forms people actually ask for.",
    tone: "six",
  },
  {
    id: "student-life",
    label: "Student life",
    blurb: "Clubs, activities, athletics, events.",
    tone: "seven",
  },
  {
    id: "student-government",
    label: "Student Government",
    blurb: "SG contacts, documents, and processes.",
    tone: "eight",
  },
] as const;

export type ResourceCategoryId = (typeof RESOURCE_CATEGORIES)[number]["id"];

/* ----------------------------------------------------- opportunity buckets */

export const OPPORTUNITY_CATEGORIES = [
  { id: "hackathons-tech", label: "Hackathons & technology", tone: "one" },
  { id: "academic-events", label: "Academic events", tone: "two" },
  { id: "competitions", label: "Competitions", tone: "three" },
  { id: "volunteering", label: "Volunteering", tone: "four" },
  { id: "arts-culture", label: "Arts & culture", tone: "five" },
  { id: "entrepreneurship", label: "Entrepreneurship", tone: "six" },
  { id: "career", label: "Career exploration", tone: "seven" },
  { id: "community", label: "Community events", tone: "eight" },
] as const;

export type OpportunityCategoryId =
  (typeof OPPORTUNITY_CATEGORIES)[number]["id"];

/* -------------------------------------------------------- discount buckets */

/**
 * What a business sells, not what deal it offers.
 *
 * The deals are unknown. The food is not, so this is the axis that can honestly
 * be filtered on, and with a list this short the chip counts double as the menu
 * of what is on offer.
 */
export const DISCOUNT_CATEGORIES = [
  { id: "pizza", label: "Pizza", tone: "one" },
  { id: "mexican", label: "Mexican", tone: "three" },
  { id: "korean", label: "Korean", tone: "six" },
  { id: "indian", label: "Indian", tone: "seven" },
  { id: "bubble-tea", label: "Bubble tea", tone: "four" },
  { id: "ice-cream", label: "Ice cream", tone: "two" },
] as const;

export type DiscountCategoryId = (typeof DISCOUNT_CATEGORIES)[number]["id"];

/* --------------------------------------------------------- amenity buckets */

/**
 * The physical things students hunt for.
 *
 * Add a kind here before adding rows of it. Nothing else needs editing: the
 * chips, counts and dots all read from this array.
 */
export const AMENITY_CATEGORIES = [
  { id: "printer", label: "Printers", tone: "one" },
  { id: "water", label: "Water refill", tone: "four" },
  { id: "microwave", label: "Microwaves", tone: "three" },
  { id: "vending", label: "Vending machines", tone: "six" },
  { id: "sanitary", label: "Sanitary products", tone: "two" },
] as const;

export type AmenityCategoryId = (typeof AMENITY_CATEGORIES)[number]["id"];

/* ------------------------------------------------------------ club buckets */

/**
 * Broad enough that a collector rarely has to agonise, narrow enough that the
 * chips are worth tapping. A club that fits two goes in the one a student
 * looking for it would try first.
 */
export const CLUB_CATEGORIES = [
  { id: "stem", label: "STEM & computing", tone: "one" },
  { id: "arts", label: "Arts & performance", tone: "two" },
  { id: "service", label: "Service & volunteering", tone: "four" },
  { id: "culture", label: "Cultural & identity", tone: "five" },
  { id: "sports", label: "Sports & recreation", tone: "seven" },
  { id: "publications", label: "Publications & media", tone: "six" },
  { id: "academic", label: "Academic & competition", tone: "three" },
  { id: "other", label: "Other", tone: "eight" },
] as const;

export type ClubCategoryId = (typeof CLUB_CATEGORIES)[number]["id"];

/* ----------------------------------------------------------- issue buckets */

export const ISSUE_CATEGORIES = [
  { id: "academics", label: "Academics" },
  { id: "residential-life", label: "Residential life" },
  { id: "dining", label: "Dining" },
  { id: "transportation", label: "Transportation" },
  { id: "technology", label: "Technology" },
  { id: "student-life", label: "Student life" },
  { id: "accessibility", label: "Accessibility" },
  { id: "other", label: "Other" },
] as const;

export type IssueCategoryId = (typeof ISSUE_CATEGORIES)[number]["id"];

/* ------------------------------------------------------------ issue status */

/**
 * The public lifecycle of an issue SG is handling.
 * `tone` drives the status pip colour. `open` groups everything still moving.
 */
export const ISSUE_STATUSES = [
  {
    id: "received",
    label: "Received",
    description: "Logged by SG. Not looked at in detail yet.",
    tone: "neutral",
    open: true,
  },
  {
    id: "under-review",
    label: "Under review",
    description: "SG is working out what can be done.",
    tone: "info",
    open: true,
  },
  {
    id: "referred",
    label: "Referred",
    description: "Passed to the office that owns the decision.",
    tone: "info",
    open: true,
  },
  {
    id: "in-progress",
    label: "In progress",
    description: "Someone is actively working on it.",
    tone: "active",
    open: true,
  },
  {
    id: "awaiting-response",
    label: "Awaiting response",
    description: "Waiting on staff, a vendor, or a scheduled meeting.",
    tone: "warn",
    open: true,
  },
  {
    id: "resolved",
    label: "Resolved",
    description: "A change was made, or a clear answer was given.",
    tone: "done",
    open: false,
  },
  {
    id: "unable-to-pursue",
    label: "Unable to pursue",
    description: "Outside what SG can influence. Reason given where possible.",
    tone: "closed",
    open: false,
  },
] as const;

export type IssueStatusId = (typeof ISSUE_STATUSES)[number]["id"];

/* -------------------------------------------------- SG transparency feed */

/**
 * What a feed entry is.
 *
 * Distinct from ISSUE_CATEGORIES on purpose: those describe a student's
 * problem, these describe Student Government's own activity.
 */
export const SG_FEED_KINDS = [
  {
    id: "meeting",
    label: "Meeting highlight",
    blurb: "What was discussed and decided at a meeting.",
    tone: "one",
  },
  {
    id: "proposal",
    label: "Policy proposal",
    blurb: "Something SG is trying to change, and where it has got to.",
    tone: "three",
  },
  {
    id: "response",
    label: "Response to feedback",
    blurb: "SG answering something students raised.",
    tone: "five",
  },
] as const;

export type SgFeedKindId = (typeof SG_FEED_KINDS)[number]["id"];

/**
 * Where a proposal stands.
 *
 * "Passed Senate" and "Adopted" are deliberately different stages. Senate
 * voting for something is not the same as it being in force, and a board that
 * blurs the two lets SG take credit for a change that never happened.
 */
export const SG_PROPOSAL_STAGES = [
  {
    id: "drafted",
    label: "Drafted",
    description: "Written up. Not yet in front of Senate.",
    tone: "neutral",
  },
  {
    id: "before-senate",
    label: "Before Senate",
    description: "On the agenda, or being debated.",
    tone: "info",
  },
  {
    id: "passed-senate",
    label: "Passed Senate",
    description: "Senate voted for it. Nothing has changed yet.",
    tone: "active",
  },
  {
    id: "with-administration",
    label: "With the administration",
    description: "Handed to the office that owns the decision.",
    tone: "warn",
  },
  {
    id: "adopted",
    label: "Adopted",
    description: "In force. Something actually changed.",
    tone: "done",
  },
  {
    id: "not-pursued",
    label: "Not pursued",
    description: "Voted down, withdrawn, or outside what SG can do.",
    tone: "closed",
  },
] as const;

export type SgProposalStageId = (typeof SG_PROPOSAL_STAGES)[number]["id"];

/* ------------------------------------------------------------- lookup maps */

function index<T extends { id: string }>(rows: readonly T[]) {
  return Object.fromEntries(rows.map((row) => [row.id, row])) as Record<
    T["id"],
    T
  >;
}

export const RESOURCE_CATEGORY_BY_ID = index(RESOURCE_CATEGORIES);
export const DISCOUNT_CATEGORY_BY_ID = index(DISCOUNT_CATEGORIES);
export const AMENITY_CATEGORY_BY_ID = index(AMENITY_CATEGORIES);
export const CLUB_CATEGORY_BY_ID = index(CLUB_CATEGORIES);
export const SG_FEED_KIND_BY_ID = index(SG_FEED_KINDS);
export const SG_PROPOSAL_STAGE_BY_ID = index(SG_PROPOSAL_STAGES);
export const OPPORTUNITY_CATEGORY_BY_ID = index(OPPORTUNITY_CATEGORIES);
export const ISSUE_CATEGORY_BY_ID = index(ISSUE_CATEGORIES);
export const ISSUE_STATUS_BY_ID = index(ISSUE_STATUSES);
export const PLATFORM_BY_ID = index(PLATFORMS);

export const RESOURCE_CATEGORY_IDS = RESOURCE_CATEGORIES.map((c) => c.id);
export const DISCOUNT_CATEGORY_IDS = DISCOUNT_CATEGORIES.map((c) => c.id);
export const AMENITY_CATEGORY_IDS = AMENITY_CATEGORIES.map((c) => c.id);
export const CLUB_CATEGORY_IDS = CLUB_CATEGORIES.map((c) => c.id);
export const SG_FEED_KIND_IDS = SG_FEED_KINDS.map((k) => k.id);
export const SG_PROPOSAL_STAGE_IDS = SG_PROPOSAL_STAGES.map((s) => s.id);
export const OPPORTUNITY_CATEGORY_IDS = OPPORTUNITY_CATEGORIES.map((c) => c.id);
export const ISSUE_CATEGORY_IDS = ISSUE_CATEGORIES.map((c) => c.id);
export const ISSUE_STATUS_IDS = ISSUE_STATUSES.map((s) => s.id);
