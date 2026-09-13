import type { SgDocument } from "./types";
import { isDemo } from "./stage";

/**
 * Site-wide configuration and Student Government content.
 *
 * `contact.email` and the document links below are the values most likely to
 * need changing before launch. They are all in this one file on purpose.
 */

export const site = {
  name: "NCSSM Navigate",
  shortName: "Navigate",
  tagline:
    "One place to find resources, opportunities, support, and student-government updates.",
  description:
    "NCSSM Navigate helps students find what they need without having to know which platform, department, or person to search for.",
  /** Scope of this release. Durham campus only. */
  campus: "NCSSM-Durham",
  schoolUrl: "https://www.ncssm.edu/",
  /**
   * The only address students are told to write to, so it needs to be
   * monitored. Confirmed as the Student Government team address.
   */
  contact: {
    email: "sg@ncssm.edu",
    note: "Goes to the Student Government team.",
  },
  /** Shown wherever the site has to tell a student where to go in a crisis. */
  crisis: {
    lifeline: "988",
    lifelineLabel: "Suicide & Crisis Lifeline",
    emergency: "911",
  },
} as const;

/**
 * Top navigation.
 *
 * Identical in both stages apart from the last item, because a demo that hides
 * half the product demonstrates half the product. Expectations are set by the
 * banner above the header and again on the form itself, which is the right
 * place for them - not by removing the page.
 */
export const nav = [
  { href: "/resources", label: "Resources" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/report", label: "Report an issue" },
  { href: "/updates", label: "SG updates" },
  { href: "/sg", label: isDemo ? "The proposal" : "About SG" },
] as const;

/**
 * Directories that are not one of the four primary actions.
 *
 * The top navigation stays at five items on purpose. Adding every directory to
 * it turns a wayfinding bar into a menu you have to read, which is the thing
 * this site exists to spare people. These are listed on the homepage under the
 * primary actions and in the footer instead.
 */
export const moreDirectories = [
  {
    href: "/academic-help",
    label: "Academic help",
    blurb: "Who helps with a subject, and when they are free.",
  },
] as const;

/**
 * The homepage shortlist, in order.
 *
 * Deliberate rather than "whichever featured rows happen to be first in the
 * file". These are the things a student opens most, and the order is the order
 * they should be scanned in. Ids that no longer exist are skipped silently, so
 * removing a resource cannot break the homepage.
 */
export const homepagePicks = [
  "daily-schedule",
  "canvas",
  "orah",
  "faculty-office-hours",
  "dining-menu",
  "helpdesk-ticket",
  "library-rooms",
  "staff-directory",
] as const;

/* --------------------------------------------------------- SG information */

export const sgAbout = {
  /** Kept deliberately concrete. Vague mission copy helps nobody. */
  whatWeDo: [
    {
      title: "Carry student concerns to the people who decide",
      body: "SG collects issues from students, works out which office actually owns the decision, and brings a consolidated case rather than scattered complaints.",
    },
    {
      title: "Represent students in school decisions",
      body: "Officers and senators sit in meetings where policies affecting student life are discussed, and report back on what was said.",
    },
    {
      title: "Run Senate and pass legislation",
      body: "Senate debates and votes on resolutions. Minutes and voting records are published so students can see how their representatives voted.",
    },
    {
      title: "Fund and support student organizations",
      body: "SG reviews club funding requests and helps new clubs get chartered.",
    },
  ],
  /** Honesty about limits. This prevents the site over-promising. */
  limits: [
    "SG cannot change grades, academic policy, or disciplinary outcomes.",
    "SG cannot access student records, and does not investigate individuals.",
    "Some issues belong to school offices or state agencies. SG refers those and says so.",
    "Anything involving safety, harassment, or a student in crisis should go to staff directly, not through this site.",
  ],
  meetings: {
    /** SEED VALUES — confirm with SG before launch. */
    senate: "Senate meets weekly during the school year. Open to all students.",
    cabinet: "Officer meetings are held weekly and are not open sessions.",
    location: "Location and time are announced on the campus calendar.",
    note: "Students may request time on the Senate agenda by emailing SG at least 48 hours ahead.",
  },
};

/**
 * SEED DATA — replace URLs before launch.
 *
 * `access: "internal"` rows render as a labelled row with no link. Use it for
 * anything that should not be handed to the public, even behind a login.
 */
export const sgDocuments: SgDocument[] = [
  {
    id: "constitution",
    title: "SG Constitution",
    description: "Structure of Student Government, offices, and election rules.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: false,
    updated: null,
  },
  {
    id: "bylaws",
    title: "Senate bylaws",
    description: "How Senate runs: quorum, voting, committees, and procedure.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: false,
    updated: null,
  },
  {
    id: "minutes",
    title: "Senate minutes",
    description:
      "Notes from each Senate meeting, including what was discussed and decided.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "legislation",
    title: "Passed legislation & resolutions",
    description: "Resolutions Senate has voted on, with outcomes.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "voting-records",
    title: "Voting records",
    description: "How each senator voted on recorded votes.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "funding-guidelines",
    title: "Club funding guidelines",
    description: "Criteria SG uses when reviewing funding requests.",
    url: "https://www.ncssm.edu/student-life",
    access: "public",
    loginRequired: false,
    updated: null,
  },
  {
    id: "issue-casework",
    title: "Issue casework files",
    description:
      "Working notes on individual submissions. Held by SG officers and never published, because they can identify the student who wrote in.",
    url: "",
    access: "internal",
    loginRequired: true,
    updated: null,
  },
  {
    id: "cabinet-notes",
    title: "Officer meeting notes",
    description:
      "Internal working notes. Decisions that affect students are reported through Senate minutes instead.",
    url: "",
    access: "internal",
    loginRequired: true,
    updated: null,
  },
];

/**
 * SEED DATA — replace with the real roster, or delete the section.
 * Names shown here are placeholders, not real students.
 */
export const sgSenate = {
  note: "Roster below is placeholder seed data. Replace it with the current roster, or remove the section until SG supplies one.",
  seats: [
    { role: "President", holder: "Vacant — add current officer" },
    { role: "Vice President", holder: "Vacant — add current officer" },
    { role: "Secretary", holder: "Vacant — add current officer" },
    { role: "Treasurer", holder: "Vacant — add current officer" },
    { role: "Senators", holder: "Elected by hall" },
  ],
};
