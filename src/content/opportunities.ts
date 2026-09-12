import type { Opportunity } from "./types";

/**
 * Real programmes, real organisations, real links.
 *
 * The rule here, learned the hard way: state only what has been checked.
 *
 * Every URL below was opened and returned 200. Facts that came from an
 * organiser's own page (age ranges, volunteer shift times, application
 * deadlines, eligibility) are stated. Anything that changes year to year and
 * was not confirmed is `dateKind: "rolling"` with an instruction to check the
 * organiser, rather than a plausible-looking date.
 *
 * An earlier version of this file invented dates and costs for real
 * organisations. That is worse than an empty board: a student turning up to
 * something that was never scheduled is the fastest way to lose their trust in
 * everything else on the site.
 *
 * `verified: false` means no NCSSM student or officer has confirmed the entry
 * end to end yet. The UI labels those.
 */
export const opportunities: Opportunity[] = [
  /* ------------------------------------------------------- research & STEM */
  {
    id: "duke-rep",
    title: "Duke Research in Engineering (DukeREP)",
    description:
      "A seven-week paid-style summer research placement in Duke's Biomedical Engineering department. Priority goes to Durham Public Schools students, but any eligible North Carolina high schooler can apply.",
    category: "academic-events",
    date: null,
    dateKind: "rolling",
    location: "Duke University, Durham",
    cost: "Check with the programme",
    eligibility:
      "Rising juniors and seniors who are 16 or older by the summer. Open to all NC high school students.",
    registrationUrl: "https://sites.duke.edu/dukerep",
    source: "Duke Biomedical Engineering",
    sourceUrl: "https://sites.duke.edu/dukerep",
    verified: false,
    featured: true,
  },
  {
    id: "duke-summer-stem",
    title: "Duke Summer STEM Academy",
    description:
      "A three-week engineering intensive built around designing a solution to a real social problem, mentored by Duke graduate students and faculty.",
    category: "academic-events",
    date: null,
    dateKind: "rolling",
    location: "Duke University, Durham",
    cost: "Check with the programme",
    eligibility: "Rising juniors and seniors.",
    registrationUrl: "https://sites.duke.edu/summerstem/",
    source: "Duke Pratt School of Engineering",
    sourceUrl: "https://sites.duke.edu/summerstem/",
    verified: false,
    featured: true,
  },
  {
    id: "duke-precollege",
    title: "Duke Pre-College summer programmes",
    description:
      "Duke's catalogue of summer sessions for grades 6 to 12, taught by Duke PhD students, graduate students, and people working in the field.",
    category: "academic-events",
    date: null,
    dateKind: "rolling",
    location: "Duke University, Durham",
    cost: "Varies by session; see the programme page",
    eligibility: "Grades 6 to 12, depending on the session.",
    registrationUrl: "https://provost.duke.edu/pre-college-programs/",
    source: "Duke Office of the Provost",
    sourceUrl: "https://provost.duke.edu/pre-college-programs/",
    verified: false,
    featured: false,
  },

  /* --------------------------------------------------------- volunteering */
  {
    id: "museum-life-science",
    title: "Museum of Life and Science summer camp volunteer",
    description:
      "Help run the museum's summer camps: supporting campers through projects and experiments and assisting camp counselors. One of the few Durham placements written specifically for teenagers.",
    category: "volunteering",
    date: null,
    dateKind: "deadline",
    location: "Museum of Life and Science, 433 W Murray Ave, Durham",
    cost: "Free",
    eligibility: "Ages 14 to 17.",
    registrationUrl: "https://www.lifeandscience.org/support/volunteer/",
    source: "Museum of Life and Science",
    sourceUrl: "https://www.lifeandscience.org/support/volunteer/",
    verified: false,
    featured: true,
  },
  {
    id: "food-bank-durham",
    title: "Food Bank of Central & Eastern NC, Durham branch",
    description:
      "Sorting and packing shifts at the Durham warehouse. Tuesday afternoons, and Wednesday to Saturday mornings and afternoons. Good for a group, and the shifts are short enough to fit a weekend.",
    category: "volunteering",
    date: null,
    dateKind: "rolling",
    location: "Food Bank of Central & Eastern NC, Durham",
    cost: "Free",
    eligibility:
      "Check the age minimum for the shift you want; some require an adult.",
    registrationUrl: "https://foodbankcenc.org/locations/durham",
    source: "Food Bank of Central & Eastern North Carolina",
    sourceUrl: "https://foodbankcenc.org/locations/durham",
    verified: false,
    featured: true,
  },
  {
    id: "durham-county-library-volunteer",
    title: "Durham County Library teen volunteering",
    description:
      "Shelving, pulling books, tutoring, and craft prep across the county branches. Ongoing rather than seasonal, which makes it one of the easier ways to build steady service hours.",
    category: "volunteering",
    date: null,
    dateKind: "rolling",
    location: "Durham County Library branches",
    cost: "Free",
    eligibility: "Age 14 and older.",
    registrationUrl: "https://durhamcountylibrary.org/volunteer-opportunities/",
    source: "Durham County Library",
    sourceUrl: "https://durhamcountylibrary.org/volunteer-opportunities/",
    verified: false,
    featured: false,
  },
  {
    id: "durham-farmers-market",
    title: "Durham Farmers' Market",
    description:
      "Saturday morning market in Central Park with a regular need for setup and breakdown help. An easy first trip off campus.",
    category: "community",
    date: null,
    dateKind: "rolling",
    location: "Durham Central Park, 501 Foster St",
    cost: "Free",
    eligibility: "Check with the market about volunteering as a minor.",
    registrationUrl: "https://www.durhamfarmersmarket.com",
    source: "Durham Farmers' Market",
    sourceUrl: "https://www.durhamfarmersmarket.com",
    verified: false,
    featured: false,
  },

  /* ------------------------------------------------ competitions & hackathons */
  {
    id: "hackduke",
    title: "HackDuke",
    description:
      "Duke's student-run hackathon, organised around social-impact tracks. Check the site for this year's dates and whether high school registration is open.",
    category: "hackathons-tech",
    date: null,
    dateKind: "rolling",
    location: "Duke University, Durham",
    cost: "Check the event site",
    eligibility:
      "Confirm high school eligibility before registering; it varies by year.",
    registrationUrl: "https://hackduke.org",
    source: "HackDuke",
    sourceUrl: "https://hackduke.org",
    verified: false,
    featured: false,
  },
  {
    id: "nc-science-olympiad",
    title: "North Carolina Science Olympiad",
    description:
      "The state Science Olympiad programme, with regional tournaments feeding a state event. NCSSM has competed historically; ask the science department how the school's team is organised.",
    category: "competitions",
    date: null,
    dateKind: "rolling",
    location: "Regional tournaments across NC",
    cost: "Team registration; check with the science department",
    eligibility: "School teams.",
    registrationUrl: "https://www.sciencenc.com",
    source: "North Carolina Science Olympiad",
    sourceUrl: "https://www.sciencenc.com",
    verified: false,
    featured: false,
  },

  /* ------------------------------------------------------- arts & community */
  {
    id: "durham-arts-council",
    title: "Durham Arts Council",
    description:
      "Classes, exhibitions, and events in downtown Durham, plus the council's own calendar of community arts programming.",
    category: "arts-culture",
    date: null,
    dateKind: "rolling",
    location: "Durham Arts Council, 120 Morris St",
    cost: "Varies by programme",
    eligibility: "Open to the public; some classes have age minimums.",
    registrationUrl: "https://durhamarts.org",
    source: "Durham Arts Council",
    sourceUrl: "https://durhamarts.org",
    verified: false,
    featured: false,
  },
  {
    id: "american-underground",
    title: "American Underground",
    description:
      "Durham's downtown startup hub. Runs events and talks that are often open to the public, and is the place to look first for anything entrepreneurial in the city.",
    category: "entrepreneurship",
    date: null,
    dateKind: "rolling",
    location: "American Underground, downtown Durham",
    cost: "Most events are free",
    eligibility: "Check each event; some are 18+.",
    registrationUrl: "https://americanunderground.com",
    source: "American Underground",
    sourceUrl: "https://americanunderground.com",
    verified: false,
    featured: false,
  },
  {
    id: "durham-library-teens",
    title: "Durham County Library: for teens",
    description:
      "The library's own teen programming: events, clubs, and study support across the branches.",
    category: "community",
    date: null,
    dateKind: "rolling",
    location: "Durham County Library branches",
    cost: "Free",
    eligibility: "Teens; some events are grade-specific.",
    registrationUrl: "https://durhamcountylibrary.org/for-teens/",
    source: "Durham County Library",
    sourceUrl: "https://durhamcountylibrary.org/for-teens/",
    verified: false,
    featured: false,
  },
];
