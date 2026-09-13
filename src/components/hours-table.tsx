import type { HoursRow } from "@/content/types";
import { Chip } from "./ui";

/**
 * Opening or serving hours, drawn as a small timetable.
 *
 * The answer to "when does the dining hall close" is a schedule, and a
 * schedule squeezed into the one-line contact note reads as a paragraph you
 * have to parse. Rows are grouped by day so the weekday block and the weekend
 * block are two things to compare rather than five lines to read.
 *
 * The unconfirmed marker is not the same claim as the directory's link caveat.
 * A link checker proves a page resolves; it proves nothing about whether
 * breakfast still ends at ten, and a student who walks over at 9:55 on the
 * strength of this deserves to know which of those two things they have.
 */
export function HoursTable({
  hours,
  confirmed,
}: {
  hours: HoursRow[];
  /** False until a person has checked these against the official source. */
  confirmed: boolean;
}) {
  if (hours.length === 0) return null;

  // Preserve the order the content file gives, and collapse repeated day
  // labels into one group each.
  const groups: Array<{ days: string; rows: HoursRow[] }> = [];
  for (const row of hours) {
    const last = groups.at(-1);
    if (last && last.days === row.days) last.rows.push(row);
    else groups.push({ days: row.days, rows: [row] });
  }

  return (
    <div className="mt-3 max-w-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="label text-faint">Hours</span>
        {confirmed ? null : <Chip tone="warn">Not confirmed yet</Chip>}
      </div>

      <dl className="mt-1.5 border-t border-line">
        {groups.map((group) => (
          <div
            key={group.days}
            className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line py-2"
          >
            <dt className="label w-full text-muted sm:w-auto sm:min-w-[9.5rem]">
              {group.days}
            </dt>
            <dd className="min-w-0 flex-1 space-y-0.5">
              {group.rows.map((row) => (
                <div
                  key={`${row.period}-${row.time}`}
                  className="flex justify-between gap-4 text-[13px] leading-relaxed"
                >
                  {/* Always rendered, empty or not, so the time column stays
                      right-aligned for a place with one window a day. */}
                  <span className="text-muted">{row.period}</span>
                  <span className="tnum text-ink">{row.time}</span>
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
