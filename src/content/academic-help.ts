/**
 * The academic help finder.
 *
 * This file adds no resources. Every route below already exists in
 * `resources.ts`; what was missing was the answer to the question students
 * actually ask, which is not "what academic support exists" but "I am stuck in
 * this subject, who helps me, and when".
 *
 * The directory cannot answer that, because it is organised by the kind of
 * thing a row is. Nine rows tagged "Academic support" is a correct answer to
 * the wrong question when you are stuck in Calculus on a Tuesday.
 *
 * Editing rules:
 *  - `resourceId` must match an id in `resources.ts`. Ids that no longer exist
 *    are skipped silently, so deleting a resource cannot break this page.
 *  - A route goes in the subject group its LINK actually serves, not the
 *    subject its title implies. "Durham TA website" sounds general and opens
 *    the computer science site, so it sits under computer science: a student
 *    stuck in English who lands on a CS page has been sent the wrong way.
 *  - `who` and `gives` summarise the resource's own description. They are not
 *    new facts, and nothing here may claim a time, a room, or a person that
 *    the underlying row does not already carry.
 */

export interface AcademicHelpEntry {
  /** An id in `resources.ts`. */
  resourceId: string;
  /** Who is on the other end: "Your teacher", "A peer TA", "An advisor". */
  who: string;
  /** What opening it gives you: "Times and rooms", "A booking form". */
  gives: string;
  /** Search words for this route on top of the resource's own aliases. */
  aliases?: string;
}

export interface AcademicHelpGroup {
  id: string;
  /** The subject or need, as a student would name it. */
  label: string;
  /** What this group covers, and what it does not. One sentence. */
  blurb: string;
  /** Words a student types when this is the group they need. */
  aliases: string;
  entries: AcademicHelpEntry[];
}

export const academicHelpGroups: AcademicHelpGroup[] = [
  {
    id: "any-subject",
    label: "Any subject",
    blurb:
      "Start here when the subject has no route of its own, or you do not know who to ask.",
    /*
     * Subject names are listed here rather than only in the subject groups.
     *
     * Most subjects have no route of their own, and a student typing
     * "chemistry" who is told nothing matches has been answered wrongly: peer
     * tutoring covers every subject and their own teacher holds office hours
     * for the class they are failing. Naming the subjects here is not a claim
     * that a chemistry-specific service exists, it is what makes the general
     * route reachable by the word a student actually types.
     */
    aliases:
      "any subject, general, not sure, dont know who to ask, do not know who to ask, any class, every subject, help with homework, homework help, falling behind, behind in class, struggling, extra help, tutor, tutoring, peer tutor, study help, chemistry, chem, biology, bio, physics, science, history, english, literature, spanish, french, chinese, latin, arabic, japanese, world language, economics, psychology, philosophy, art, music, research",
    entries: [
      {
        resourceId: "saa-durham-site",
        who: "Peer tutors",
        gives: "The programme and how to reach it",
        aliases: "peer tutoring across subjects, student tutor, saa",
      },
      {
        resourceId: "faculty-office-hours",
        who: "Your own teacher",
        gives: "Every Durham teacher's hours, in one sheet",
        aliases:
          "when is my teacher free, my teacher, specific teacher, find my teacher, ask my teacher",
      },
      {
        resourceId: "instructor-tutoring-hours",
        who: "Instructors",
        gives: "Office hours and course tutoring together",
        aliases: "course tutoring, when is tutoring, tutoring schedule",
      },
    ],
  },
  {
    id: "math",
    label: "Math",
    blurb: "Peer TAs, a bookable slot, and a calendar of support sessions.",
    aliases:
      "math, maths, stuck in math, struggling in math, bad at math, failing math, do not understand math, dont understand math, calculus, calc, precalc, precalculus, algebra, geometry, trig, trigonometry, statistics, stats, discrete, linear algebra, problem set, math homework",
    entries: [
      {
        resourceId: "math-ta-hours",
        who: "A math TA",
        gives: "When and where they hold hours",
        aliases: "drop in math help, walk in math help",
      },
      {
        resourceId: "math-ta-signup",
        who: "A math TA",
        gives: "A booking form for one-on-one or small-group help",
        aliases: "book math help, schedule math help, one on one math",
      },
      {
        resourceId: "math-support-calendar",
        who: "Math support sessions",
        gives: "A calendar you can subscribe to",
        aliases: "math calendar, subscribe, add to my calendar",
      },
    ],
  },
  {
    id: "computer-science",
    label: "Computer science & engineering",
    blurb:
      "The ECS routes: teaching assistants, the department's own TA site, and teacher office hours.",
    aliases:
      "cs, computer science, coding, programming, code, python, java, debug, debugging, engineering, ecs, robotics, stuck in cs, cs homework, my code does not work, my code doesnt work",
    entries: [
      {
        resourceId: "cs-tas",
        who: "A CS TA",
        gives: "The roster and their hours",
        aliases: "cs ta roster, coding help, programming help",
      },
      {
        resourceId: "durham-ta-site",
        who: "Teaching assistants",
        gives: "Who they are, what they cover, when they meet",
        aliases: "ta site, ta website, ta schedule",
      },
      {
        resourceId: "ecs-office-hours",
        who: "An ECS teacher",
        gives: "When they are free outside class, and where",
        aliases: "ecs office hours, cs office hours, ask a cs teacher",
      },
    ],
  },
  {
    id: "writing",
    label: "Writing & essays",
    blurb:
      "Essays, lab reports, research papers, and college application writing.",
    aliases:
      "writing, essay, essays, paper, papers, english, humanities, lab report, research paper, college essay, personal statement, proofread, edit my essay, revise, feedback on my writing, thesis, citation",
    entries: [
      {
        resourceId: "writing-center",
        who: "The Writing Center",
        gives: "A session you book",
        aliases: "book a writing session, writing tutor, writing help",
      },
    ],
  },
  {
    id: "advising",
    label: "Course choices & advising",
    blurb:
      "Not subject help. This is for what to take, what to drop, and what the rules are.",
    aliases:
      "advising, advisor, caas, course change, drop a class, add a class, schedule change, what should i take, course selection, credit, requirements, pass no pass, extension, graduation requirements",
    entries: [
      {
        resourceId: "caas-appointment",
        who: "An advisor",
        gives: "A request form for a meeting",
        aliases: "book an advisor, meet an advisor, talk to an advisor",
      },
      {
        resourceId: "caas-faq",
        who: "CAAS",
        gives: "Written answers to the common questions",
        aliases: "advising faq, common questions, how do i",
      },
    ],
  },
];

/**
 * The chips under the search.
 *
 * Same job as the homepage examples: each is a plain sentence that only lands
 * because of an `aliases` field, which is otherwise invisible. They are the
 * fastest way to show someone that typing how they actually feel works here.
 */
export const academicHelpExamples = [
  "stuck in math",
  "need a tutor",
  "when is my teacher free",
  "essay help",
  "drop a class",
];
