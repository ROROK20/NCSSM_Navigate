import type { Resource } from "./types";

/**
 * SEED DATA — replace before public launch.
 *
 * Every row below was written from public knowledge of how NCSSM is organised,
 * not from a list supplied by the school. Treat each `officialUrl` as a
 * placeholder until someone opens it and flips `verificationStatus` to
 * "verified" (the /admin page does this).
 *
 * Editing rules:
 *  - `officialUrl` must be the school's own address. Never mirror, proxy, or
 *    re-host content that sits behind an NCSSM login.
 *  - Set `loginRequired: true` whenever the destination asks for an NCSSM
 *    account, and let the student authenticate on that platform.
 *  - `contactEmail` is for offices and departments only, never an individual
 *    student.
 */
export const resources: Resource[] = [
  /* ------------------------------------------------------ urgent support */
  {
    id: "campus-safety",
    name: "Campus Safety & Security",
    description:
      "Staffed around the clock. Call for anything unsafe on campus, a locked building, or a medical situation that is not a 911 emergency.",
    category: "urgent-support",
    officialUrl: "https://www.ncssm.edu/campus-safety",
    audience: "All students",
    contactNote: "Call Campus Police first for anything urgent on campus.",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "counseling-urgent",
    name: "Counseling Services — urgent help",
    description:
      "Talk to a counselor when something cannot wait. Includes after-hours guidance and the on-call process for residential students.",
    category: "urgent-support",
    officialUrl: "https://www.ncssm.edu/student-life/counseling-services",
    audience: "All students",
    contactNote:
      "988 reaches the Suicide & Crisis Lifeline any time, from any phone.",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "health-services",
    name: "Student Health Services",
    description:
      "Nurses on campus for illness, injury, medication, and appointment scheduling. Start here before going off campus for care.",
    category: "urgent-support",
    officialUrl: "https://www.ncssm.edu/student-life/health-services",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* ---------------------------------------------------- academic support */
  {
    id: "canvas",
    name: "Canvas",
    description:
      "Course pages, assignments, and grades for most classes. Navigate links you straight to Canvas; it does not read or copy your coursework.",
    category: "academic-support",
    officialUrl: "https://ncssm.instructure.com",
    audience: "All students",
    loginRequired: true,
    platform: "canvas",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "tutorial-center",
    name: "Peer tutoring",
    description:
      "Free subject tutoring from other students. Check the schedule for which subjects are covered on which nights.",
    category: "academic-support",
    officialUrl: "https://www.ncssm.edu/academics",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "writing-center",
    name: "Writing Center",
    description:
      "Book a session for essays, lab reports, research papers, and college application writing.",
    category: "academic-support",
    officialUrl: "https://www.ncssm.edu/academics",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "library",
    name: "NCSSM Library",
    description:
      "Catalog, research databases, interlibrary loan, and quiet study space. Databases ask for your NCSSM account.",
    category: "academic-support",
    officialUrl: "https://www.ncssm.edu/library",
    audience: "All students",
    loginRequired: true,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* ------------------------------------------------ advising & counseling */
  {
    id: "counseling-services",
    name: "Counseling Services",
    description:
      "Scheduled, confidential appointments for stress, homesickness, conflict, and anything else you want to talk through.",
    category: "advising-counseling",
    officialUrl: "https://www.ncssm.edu/student-life/counseling-services",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "college-counseling",
    name: "College Counseling",
    description:
      "Your college counselor, application deadlines, transcript requests, and recommendation letter timelines.",
    category: "advising-counseling",
    officialUrl: "https://www.ncssm.edu/academics/college-counseling",
    audience: "Juniors and seniors",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "academic-advising",
    name: "Academic advising",
    description:
      "Course selection, schedule changes, add/drop windows, and graduation requirement questions.",
    category: "advising-counseling",
    officialUrl: "https://www.ncssm.edu/academics",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* ----------------------------------------------------- residential life */
  {
    id: "residential-life",
    name: "Residential Life",
    description:
      "Who your RLI is, hall expectations, room changes, and how the residential day is structured.",
    category: "residential-life",
    officialUrl: "https://www.ncssm.edu/student-life/residential-life",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "signout",
    name: "Sign-out & travel permissions",
    description:
      "Leaving campus, weekend travel, and parent permission. Submitted through the student information system.",
    category: "residential-life",
    officialUrl: "https://ncssm.myschoolapp.com",
    audience: "Residential students",
    loginRequired: true,
    platform: "blackbaud",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "maintenance-request",
    name: "Facilities & maintenance request",
    description:
      "Report a broken light, a stuck window, heating or cooling problems, and anything else physically wrong with your room or hall.",
    category: "residential-life",
    officialUrl: "https://www.ncssm.edu/student-life/residential-life",
    audience: "Residential students",
    loginRequired: false,
    platform: "form",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "laundry-mail",
    name: "Mail room & package pickup",
    description:
      "Where packages go, pickup hours, and how to address mail so it reaches you.",
    category: "residential-life",
    officialUrl: "https://www.ncssm.edu/student-life",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* ------------------------------------------------ dining & transportation */
  {
    id: "dining-menu",
    name: "Dining hall menus & hours",
    description:
      "What is being served, when the dining hall is open, and how to flag an allergy or dietary need.",
    category: "dining-transportation",
    officialUrl: "https://www.ncssm.edu/student-life/dining",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "bus-transportation",
    name: "Student transportation & break buses",
    description:
      "Bus schedules for breaks, pickup points across North Carolina, and how to reserve a seat.",
    category: "dining-transportation",
    officialUrl: "https://www.ncssm.edu/student-life",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "durham-transit",
    name: "GoDurham transit",
    description:
      "Public bus routes and live arrival times around Durham. Useful for getting to volunteering and community events off campus.",
    category: "dining-transportation",
    officialUrl: "https://godurhamtransit.org",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* --------------------------------------------------------- technology */
  {
    id: "it-helpdesk",
    name: "IT Help Desk",
    description:
      "Laptop problems, wifi that will not connect, printing, and account lockouts. Start here before anything else tech related.",
    category: "technology",
    officialUrl: "https://www.ncssm.edu/its",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "ncssm-email",
    name: "NCSSM email & Google Workspace",
    description:
      "Your school email, Drive, Docs, and Calendar. Navigate links you to Google's own sign-in; it never sees your password or your files.",
    category: "technology",
    officialUrl: "https://mail.google.com",
    audience: "All students",
    loginRequired: true,
    platform: "google",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "blackbaud",
    name: "Student information system",
    description:
      "Schedule, attendance, report cards, and permissions. This is the system most official student records live in.",
    category: "technology",
    officialUrl: "https://ncssm.myschoolapp.com",
    audience: "All students",
    loginRequired: true,
    platform: "blackbaud",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "wifi",
    name: "Campus wifi setup",
    description:
      "Which network to join, how to register a personal device, and what to do when a device keeps dropping off.",
    category: "technology",
    officialUrl: "https://www.ncssm.edu/its",
    audience: "Residential students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* -------------------------------------------------------------- forms */
  {
    id: "transcript-request",
    name: "Transcript request",
    description:
      "Request an official transcript for colleges, summer programs, and scholarship applications.",
    category: "forms",
    officialUrl: "https://www.ncssm.edu/registrar",
    audience: "All students and alumni",
    loginRequired: false,
    platform: "form",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "club-charter",
    name: "Club charter & renewal form",
    description:
      "Start a new club or renew an existing one for the year, including advisor sign-off.",
    category: "forms",
    officialUrl: "https://www.ncssm.edu/student-life",
    audience: "Club officers",
    loginRequired: true,
    platform: "form",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "funding-request",
    name: "Student activity funding request",
    description:
      "Ask for funding for a club event, competition travel, or supplies. Read the deadline before you start.",
    category: "forms",
    officialUrl: "https://www.ncssm.edu/student-life",
    audience: "Club officers",
    loginRequired: true,
    platform: "form",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* -------------------------------------------------------- student life */
  {
    id: "clubs-directory",
    name: "Clubs & organizations",
    description:
      "The full list of chartered clubs, who leads them, and when they meet.",
    category: "student-life",
    officialUrl: "https://www.ncssm.edu/student-life",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "athletics",
    name: "Athletics & intramurals",
    description:
      "Team rosters, practice times, game schedules, and how to join an intramural league mid-season.",
    category: "student-life",
    officialUrl: "https://www.ncssm.edu/student-life/athletics",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "campus-calendar",
    name: "Campus calendar",
    description:
      "Academic dates, breaks, exam windows, and all-school events in one calendar.",
    category: "student-life",
    officialUrl: "https://www.ncssm.edu/calendar",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },

  /* --------------------------------------------------- student government */
  {
    id: "sg-contact",
    name: "Contact Student Government",
    description:
      "Reach SG directly about anything Navigate does not cover, including things you would rather say to a person.",
    category: "student-government",
    officialUrl: "/sg",
    audience: "All students",
    loginRequired: false,
    platform: "email",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
  {
    id: "sg-report-issue",
    name: "Report an issue to SG",
    description:
      "Submit a concern about academics, housing, dining, transport, tech, or accessibility. You can submit anonymously.",
    category: "student-government",
    officialUrl: "/report",
    audience: "All students",
    loginRequired: false,
    platform: "form",
    lastVerified: null,
    verificationStatus: "needs-review",
    featured: true,
  },
  {
    id: "sg-updates-link",
    name: "SG issue status board",
    description:
      "See what SG is working on right now and where each item stands, without any private details.",
    category: "student-government",
    officialUrl: "/updates",
    audience: "All students",
    loginRequired: false,
    platform: "web",
    lastVerified: null,
    verificationStatus: "needs-review",
  },
];
