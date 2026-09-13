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
 * Every destination on the site, grouped the way a student would look for it.
 *
 * One list, because there are now ten of these and they were previously
 * described in four places: the header, the mobile sheet, the homepage, and
 * the footer. The header carried five of them and the mobile menu carried the
 * same five, which meant half the site was reachable only from the homepage.
 *
 * `inNav` is the handful that earn a slot in the top bar. Everything else is
 * one tap away behind "More" on desktop and listed in full in the mobile
 * sheet, so no page is ever a dead end.
 */
export interface Destination {
  href: string;
  label: string;
  /** One line, used in the menus and on the homepage index. */
  blurb: string;
  /** Shown in the top bar. Everything else lives behind "More". */
  inNav?: boolean;
}

export interface SiteSection {
  id: string;
  label: string;
  items: Destination[];
}

export const siteSections: SiteSection[] = [
  {
    id: "find",
    label: "Find something",
    items: [
      {
        href: "/resources",
        label: "Resources",
        blurb: "Every NCSSM system, searchable by what you are trying to do.",
        inNav: true,
      },
      {
        href: "/academic-help",
        label: "Academic help",
        blurb: "Who helps with a subject, and when they are free.",
      },
      {
        href: "/amenities",
        label: "Amenities",
        blurb: "The nearest printer, microwave, or refill station.",
      },
      {
        href: "/clubs",
        label: "Clubs",
        blurb: "What each club does, when it meets, who to email.",
      },
    ],
  },
  {
    id: "durham",
    label: "Around Durham",
    items: [
      {
        href: "/opportunities",
        label: "Opportunities",
        blurb: "Hackathons, competitions, volunteering, and events.",
        inNav: true,
      },
      {
        href: "/discounts",
        label: "Student discounts",
        // "Working now" sits beside this on the homepage, so the blurb has to
        // carry the limit: the places are confirmed, the deals are not.
        blurb: "Durham places SG collected. The deals are not confirmed yet.",
      },
    ],
  },
  {
    id: "student-government",
    label: "Student Government",
    items: [
      {
        href: "/report",
        label: "Report an issue",
        blurb: "Tell SG what is not working. Anonymously, if you want.",
        inNav: true,
      },
      {
        href: "/updates",
        label: "SG updates",
        blurb: "Where each reported problem has got to.",
        inNav: true,
      },
      {
        href: "/transparency",
        label: "SG transparency",
        blurb: "Meetings, proposals, and replies to student feedback.",
      },
      {
        href: isDemo ? "/sg" : "/sg",
        label: isDemo ? "The proposal" : "About SG",
        blurb: isDemo
          ? "What this is, what works today, and what adopting it would take."
          : "What Student Government does, and what it cannot do.",
        inNav: true,
      },
    ],
  },
];

/** Flat list, in section order. The menus and the sitemap read from this. */
export const destinations: Destination[] = siteSections.flatMap((s) => s.items);

/** The top bar. Deliberately short; "More" carries the rest. */
export const nav = destinations.filter((item) => item.inNav);

/** Everything the top bar does not have room for. */
export const moreDirectories = destinations.filter((item) => !item.inNav);

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
 * Student Government's own documents.
 *
 * These pointed at a placeholder until the Durham SG site was found at
 * dur-sg.ncssm.edu. Each URL below was opened and its page title checked.
 * `minutes` and `voting-records` share a page because SG publishes them
 * together, and `constitution` and `bylaws` share the Guiding Documents page
 * for the same reason.
 *
 * `access: "internal"` rows render as a labelled row with no link. Use it for
 * anything that should not be handed to the public, even behind a login.
 */
export const sgDocuments: SgDocument[] = [
  {
    id: "constitution",
    title: "SG Constitution",
    description: "Structure of Student Government, offices, and election rules.",
    url: "https://dur-sg.ncssm.edu/operations/guiding-documents",
    access: "public",
    loginRequired: false,
    updated: null,
  },
  {
    id: "bylaws",
    title: "Senate bylaws",
    description: "How Senate runs: quorum, voting, committees, and procedure.",
    url: "https://dur-sg.ncssm.edu/operations/guiding-documents",
    access: "public",
    loginRequired: false,
    updated: null,
  },
  {
    id: "minutes",
    title: "Senate minutes",
    description:
      "Notes from each Senate meeting, including what was discussed and decided.",
    url: "https://dur-sg.ncssm.edu/operations/voting-records-minutes",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "legislation",
    title: "Passed legislation & resolutions",
    description: "Resolutions Senate has voted on, with outcomes.",
    url: "https://dur-sg.ncssm.edu/operations/legislation_1",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "voting-records",
    title: "Voting records",
    description: "How each senator voted on recorded votes.",
    url: "https://dur-sg.ncssm.edu/operations/voting-records-minutes",
    access: "public",
    loginRequired: true,
    updated: null,
  },
  {
    id: "funding-guidelines",
    title: "Club funding guidelines",
    description: "Criteria SG uses when reviewing funding requests.",
    url: "https://dur-sg.ncssm.edu/clubs/clubs-and-funding",
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
