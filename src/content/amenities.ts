import type { Amenity } from "./types";

/**
 * Where the physical things are: printers, water refill stations, microwaves,
 * vending machines, sanitary product dispensers.
 *
 * DELIBERATELY EMPTY. Nobody has walked the buildings and written any of this
 * down, and there is no page anywhere to copy it from. An invented row here
 * sends a student up three flights for a printer that is not there, which is
 * worse than the empty state they get instead, because the empty state at
 * least tells them the truth in one line.
 *
 * TO FILL IT IN
 *  1. `npm run content:export amenities` writes amenities.csv (headers only
 *     while this list is empty).
 *  2. Upload that to a Google Sheet and collect there. Several people can walk
 *     different buildings at once, which is the only way this gets done.
 *  3. Export the sheet back to CSV and run
 *     `npm run content:import amenities <file.csv>`.
 *  4. `git diff` to review, then commit.
 *
 * Or add rows to this array by hand. Either works; do not do both at once.
 *
 * WRITING A ROW
 *  - `building` is the name on the signage, not the name people say.
 *  - `place` is what you walk to: "Room 214" or "the lounge past the
 *    stairwell". Both are fine; vagueness that still gets someone there beats
 *    a precise room number that is wrong.
 *  - `notes` is anything that changes the trip: takes card only, needs a
 *    staff key, out of order since September.
 *  - `lastChecked` is the day somebody stood in front of it. Leave it empty
 *    rather than stamping today on something you were told about.
 *  - Add the kind to AMENITY_CATEGORIES in taxonomy.ts before adding rows of
 *    a kind that is not there yet.
 *
 * BUILDING NAMES, from the campus map in the 2026-2027 Durham Student
 * Handbook. Use these spellings so that searching one building returns
 * everything in it rather than half of it:
 *
 *   Bryan (library on floor 1, cafeteria in the basement, Student Life
 *   office), ETC (Educational Technology Complex: auditorium, lecture hall,
 *   music suite, Woolworth Room), Hunt (student health clinic, 1st floor
 *   east), Royall, Reynolds, Beall, Watts, Hill, Cottage, PEC (the gym),
 *   FabLab, and the Modular Residence Halls.
 *
 * The campus is 1219 Broad Street, Durham NC 27705.
 */
export const amenities: Amenity[] = [];
