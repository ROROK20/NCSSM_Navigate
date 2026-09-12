import { ISSUE_STATUSES } from "@/content/taxonomy";
import type { IssueStatusId } from "@/content/taxonomy";
import { statusVar, type StatusTone } from "./ui";

/**
 * Where one issue sits in the pipeline, drawn as the pipeline itself.
 *
 * A coloured pill tells you the current stage. It does not tell you that there
 * are five stages before "resolved", that "referred" is not a dead end, or that
 * something sitting at "awaiting response" has already been through three
 * steps. The track shows the shape of the process, which is the part students
 * have never been able to see.
 *
 * The two closed states sit outside the run rather than at the end of it:
 * "unable to pursue" is an outcome, not progress, and drawing it as the far
 * right of a track would imply it is the goal.
 */

const RUN: IssueStatusId[] = [
  "received",
  "under-review",
  "referred",
  "in-progress",
  "awaiting-response",
];

export function StageTrack({ status }: { status: IssueStatusId }) {
  const meta = ISSUE_STATUSES.find((s) => s.id === status);
  if (!meta) return null;

  const closed = !meta.open;
  const index = RUN.indexOf(status);
  const colour = statusVar(meta.tone as StatusTone);

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-[3px]"
        role="img"
        aria-label={
          closed
            ? `Closed: ${meta.label}`
            : `Stage ${index + 1} of ${RUN.length}: ${meta.label}`
        }
      >
        {RUN.map((step, i) => {
          // A closed issue fills the whole run: it went through the process,
          // whatever the outcome was.
          const filled = closed || i <= index;
          return (
            <span
              key={step}
              className="h-[3px] w-4 rounded-full transition-colors duration-200 sm:w-5"
              style={{
                background: filled ? colour : "var(--line-strong)",
                opacity: filled ? 1 : 0.45,
              }}
            />
          );
        })}
      </div>
      {/*
        The label takes an ink colour, not the status colour. Status hues were
        chosen for 7px dots and 1px borders, where the bar is 3:1; at 11px they
        are text and fail AA. The track beside it already carries the colour.
      */}
      <span className="text-[11px] font-medium whitespace-nowrap text-muted">
        {meta.label}
      </span>
    </div>
  );
}

/**
 * How many issues sit at each stage, as a single strip.
 *
 * The summary before the detail: someone who wants to know whether anything is
 * actually moving should get that in one glance, without reading eighteen rows.
 */
export function StageSummary({
  counts,
  active,
  onSelect,
}: {
  counts: Record<string, number>;
  active: IssueStatusId | null;
  onSelect: (status: IssueStatusId | null) => void;
}) {
  return (
    <div className="-mx-4 flex gap-px overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {ISSUE_STATUSES.map((status) => {
        const count = counts[status.id] ?? 0;
        const selected = active === status.id;
        return (
          <button
            key={status.id}
            type="button"
            aria-pressed={selected}
            disabled={count === 0 && !selected}
            onClick={() => onSelect(selected ? null : status.id)}
            className={[
              "flex min-w-[7.5rem] flex-1 flex-col items-start gap-1.5 border-t-2 px-3 py-2.5 text-left transition-colors duration-150",
              selected ? "bg-sunken" : "hover:bg-sunken",
              count === 0 && !selected ? "opacity-45" : "",
            ].join(" ")}
            style={{
              borderTopColor: statusVar(status.tone as StatusTone),
            }}
          >
            <span className="tnum text-xl leading-none font-semibold text-ink">
              {count}
            </span>
            <span className="text-[11px] leading-tight text-muted">
              {status.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
