"use client";

import { useMemo, useState } from "react";
import { SG_FEED_KINDS } from "@/content/taxonomy";
import { matchesQuery } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import {
  Button,
  CategoryTag,
  Chip,
  EmptyState,
  StatusPip,
  type StatusTone,
  type Tone,
} from "./ui";

/**
 * A feed entry with its dates already formatted on the server.
 *
 * Ordered, not ranked. This is a timeline, so newest wins regardless of how
 * well a row matches a search, and `matchesQuery` is the right tool rather
 * than `scoreMatch`: filtering a list of what happened must not silently
 * reorder when.
 */
export interface SgFeedView {
  id: string;
  kind: string;
  kindLabel: string;
  kindTone: Tone;
  title: string;
  body: string;
  stageLabel: string | null;
  stageTone: StatusTone | null;
  example: boolean;
  monthLabel: string | null;
  dayLabel: string | null;
  dateLabel: string | null;
}

export function SgFeedBoard({ entries }: { entries: SgFeedView[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string | null>(null);

  const afterTextFilters = useMemo(
    () =>
      entries.filter((entry) =>
        matchesQuery(
          [entry.title, entry.body, entry.kindLabel, entry.stageLabel]
            .filter(Boolean)
            .join(" "),
          query,
        ),
      ),
    [entries, query],
  );

  const options = useMemo(
    () =>
      SG_FEED_KINDS.map((option) => ({
        id: option.id,
        label: option.label,
        count: afterTextFilters.filter((entry) => entry.kind === option.id)
          .length,
      })),
    [afterTextFilters],
  );

  const visible = kind
    ? afterTextFilters.filter((entry) => entry.kind === kind)
    : afterTextFilters;

  const filtered = query.trim().length > 0 || kind !== null;

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search meetings, proposals, and responses"
        options={options}
        active={kind}
        onActiveChange={setKind}
        totalCount={afterTextFilters.length}
      />

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "entry" : "entries"}
        {filtered
          ? visible.length === 1
            ? " matches your filters"
            : " match your filters"
          : ""}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing matches that"
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setKind(null);
              }}
            >
              Clear filters
            </Button>
          }
        >
          This feed only covers what Student Government has written up. A gap
          here means nobody posted, not that nothing happened.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((entry) => (
            <FeedRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedRow({ entry }: { entry: SgFeedView }) {
  return (
    <li className="border-b border-line py-5">
      <div className="flex gap-4 sm:gap-6">
        {/* Date rail, as on the opportunities board: this is a timeline and it
            should read as one at a glance. */}
        <div className="tnum w-14 shrink-0 text-center sm:w-16">
          <span className="label block text-accent">{entry.monthLabel}</span>
          <span className="block text-2xl leading-tight font-semibold text-ink">
            {entry.dayLabel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold text-ink">{entry.title}</h3>
            {/* Labelled on the row itself, not only in a notice at the top. A
                notice is read once; a row is read wherever someone lands. */}
            {entry.example ? <Chip tone="warn">Example entry</Chip> : null}
          </div>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {entry.body}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <CategoryTag label={entry.kindLabel} tone={entry.kindTone} />
            {entry.stageLabel && entry.stageTone ? (
              <StatusPip label={entry.stageLabel} tone={entry.stageTone} />
            ) : null}
            <span className="tnum text-[11px] text-faint">
              {entry.dateLabel}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
