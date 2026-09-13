import type { Club } from "./types";

/**
 * The student club directory.
 *
 * DELIBERATELY EMPTY. No club is listed because none has been collected, and
 * a plausible-sounding club is worse than no club: a student emails an address
 * nobody reads, or turns up on a Tuesday to an empty room, and concludes the
 * whole site is made up.
 *
 * While this is empty the page points students at the school's own clubs page,
 * which is already in the resource directory.
 *
 * TO FILL IT IN
 *  1. `npm run content:export clubs` writes clubs.csv (headers only while this
 *     list is empty).
 *  2. Upload it to a Google Sheet. Club officers can fill in their own row,
 *     which is the only version of this that stays current for more than a
 *     term.
 *  3. Export back to CSV and run `npm run content:import clubs <file.csv>`.
 *  4. `git diff` to review, then commit.
 *
 * WRITING A ROW
 *  - `does` is what a member actually does at a meeting, not a mission
 *    statement. It is what search matches on, so "builds robots for FIRST
 *    competitions" finds the row and "fosters innovation" does not.
 *  - `contactEmail`: prefer a club address. A student's own address on a
 *    public page is that student's decision, so ask before using one.
 *  - `instagram` is the handle alone, no @ and no URL.
 *  - Leave a field empty rather than guessing. An empty meeting time renders
 *    as "not listed", which is honest; a guessed one sends someone to a room.
 */
export const clubs: Club[] = [];
