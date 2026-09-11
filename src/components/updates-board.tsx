"use client";

import { useMemo, useState } from "react";
import type { SgUpdate } from "@/content/types";
import {
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_BY_ID,
  ISSUE_STATUS_BY_ID,
} from "@/content/taxonomy";
import { matchesQuery } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import { Button, EmptyState, StatusPip, type StatusTone } from "./ui";

export interface UpdateView extends SgUpdate {
  /** Formatted on the server so both renders agree. */
  dateLabel: string | null;
  open: boolean;
}

export function UpdatesBoard({ updates }: { updates: UpdateView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [phase, setPhase] = useState<"all" | "open" | "closed">("all");

  const afterTextFilters = useMemo(
    () =>
      updates.filter((update) => {
        const haystack = [
          update.title,
          update.summary,
          update.nextStep,
          ISSUE_CATEGORY_BY_ID[update.category]?.label,
          ISSUE_STATUS_BY_ID[update.status]?.label,
        ]
          .filter(Boolean)
          .join(" ");
        const phaseOk =
          phase === "all" ||
          (phase === "open" ? update.open : !update.open);
        return matchesQuery(haystack, query) && phaseOk;
      }),
    [updates, query, phase],
  );

  const options = useMemo(
    () =>
      ISSUE_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: afterTextFilters.filter((u) => u.category === cat.id).length,
      })).filter((option) => option.count > 0 || category === option.id),
    [afterTextFilters, category],
  );

  const visible = category
    ? afterTextFilters.filter((u) => u.category === category)
    : afterTextFilters;

  const openCount = updates.filter((u) => u.open).length;

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search updates"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={afterTextFilters.length}
      >
        <div
          role="group"
          aria-label="Filter by stage"
          className="mt-2.5 flex gap-1.5 text-[13px]"
        >
          {(
            [
              ["all", "Any stage"],
              ["open", `Still open ${openCount}`],
              ["closed", `Closed ${updates.length - openCount}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPhase(value)}
              aria-pressed={phase === value}
              className={
                phase === value
                  ? "rounded-full bg-ink px-3 py-1.5 font-medium text-paper"
                  : "rounded-full px-3 py-1.5 text-muted transition-colors hover:bg-sunken hover:text-ink"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </FilterBar>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "update" : "updates"}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title="No updates match that"
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setCategory(null);
                setPhase("all");
              }}
            >
              Clear filters
            </Button>
          }
        >
          The board only lists issues SG has logged. A missing topic usually
          means nobody has reported it yet.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((update) => {
            const status = ISSUE_STATUS_BY_ID[update.status];
            const category = ISSUE_CATEGORY_BY_ID[update.category];
            return (
              <li key={update.id} className="border-b border-line py-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusPip
                    label={status.label}
                    tone={status.tone as StatusTone}
                  />
                  <span className="label text-faint">{category.label}</span>
                  <span className="tnum ml-auto text-xs text-faint">
                    Updated {update.dateLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                  {update.title}
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">
                  {update.summary}
                </p>

                {update.nextStep ? (
                  <p className="mt-3 max-w-3xl border-t border-line pt-3 text-sm leading-relaxed text-muted">
                    <span className="label mr-2 text-faint">Next</span>
                    {update.nextStep}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
