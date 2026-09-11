import type { SgUpdate } from "./types";

/**
 * SEED DATA — replace before public launch.
 *
 * This is the only issue-related content that is ever public. Each entry is
 * written by SG from scratch, not copied out of a submission.
 *
 * Rules for writing an entry:
 *  - Generalize. "Laundry machines on one hall" not "the third dryer in 3rd Bryan".
 *  - Never include a name, an email, a room number, or a quote from a submission.
 *  - Never promise an outcome. Describe what SG actually did.
 *  - If SG cannot act, say so plainly and give the reason where you can.
 */
export const sgUpdates: SgUpdate[] = [
  {
    id: "u-laundry",
    title: "Laundry machines out of service in residence halls",
    category: "residential-life",
    status: "in-progress",
    dateUpdated: "2026-09-08",
    summary:
      "Several students reported machines that take payment without running. SG collected the affected halls and passed a consolidated list to Residential Life, who have opened a vendor ticket.",
    nextStep:
      "Residential Life expects a vendor visit within two weeks. SG will re-check the halls afterward.",
  },
  {
    id: "u-dining-hours",
    title: "Dining hall hours during weekend study periods",
    category: "dining",
    status: "awaiting-response",
    dateUpdated: "2026-09-06",
    summary:
      "Requests to extend weekend serving hours were raised at Senate. SG has asked Dining Services for the staffing constraints behind the current schedule so any proposal is realistic.",
    nextStep: "Waiting on a written response from Dining Services.",
  },
  {
    id: "u-wifi-dorms",
    title: "Weak wifi coverage in some residence hall rooms",
    category: "technology",
    status: "referred",
    dateUpdated: "2026-09-04",
    summary:
      "Reports clustered in a small number of rooms rather than whole buildings. SG referred the room list to ITS, which owns access point placement.",
    nextStep: "ITS is running a coverage survey. No date committed yet.",
  },
  {
    id: "u-late-bus",
    title: "Break bus arrival times published late",
    category: "transportation",
    status: "resolved",
    dateUpdated: "2026-08-30",
    summary:
      "Students asked for schedules earlier so families can plan pickups. The office agreed to publish the break schedule at least three weeks ahead.",
    nextStep: null,
  },
  {
    id: "u-quiet-space",
    title: "More quiet study space in the evenings",
    category: "student-life",
    status: "under-review",
    dateUpdated: "2026-09-09",
    summary:
      "SG is comparing which rooms are already bookable in the evening against where students say they actually want to study, before asking for any schedule change.",
    nextStep: "Findings go to Senate at the next meeting.",
  },
  {
    id: "u-accessibility-doors",
    title: "Accessible entrances on one academic route",
    category: "accessibility",
    status: "in-progress",
    dateUpdated: "2026-09-02",
    summary:
      "A route between two buildings was reported as difficult to use with mobility equipment. SG walked the route with Facilities and documented the specific points that cause problems.",
    nextStep: "Facilities is costing two options. SG will report back either way.",
  },
  {
    id: "u-grading-policy",
    title: "Request to change a department grading policy",
    category: "academics",
    status: "unable-to-pursue",
    dateUpdated: "2026-08-26",
    summary:
      "Grading policy sits with academic departments and the administration, not with SG. SG passed the concern to the department chair but cannot change the policy itself.",
    nextStep:
      "Students who want to pursue this should raise it with the department directly.",
  },
  {
    id: "u-club-funding",
    title: "Clarity on how club funding decisions are made",
    category: "student-life",
    status: "received",
    dateUpdated: "2026-09-10",
    summary:
      "Recent submissions asked why some funding requests are approved and others are not. SG has logged this and will publish the criteria it uses.",
    nextStep: null,
  },
];
