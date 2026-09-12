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
import { Button, EmptyState } from "./ui";
import { StageSummary, StageTrack } from "./stage-track";
import type { IssueStatusId } from "@/content/taxonomy";

export interface UpdateView extends SgUpdate {
  /** Formatted on the server so both renders agree. */
  dateLabel: string | null;
  open: boolean;
}

export function UpdatesBoard({ updates }: { updates: UpdateView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [stage, setStage] = useState<IssueStatusId | null>(null);

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
        return matchesQuery(haystack, query);
      }),
    [updates, query],
  );

  /* Counts come from the text-filtered set, so the strip always describes what
     selecting a stage would actually give you. */
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const update of afterTextFilters) {
      counts[update.status] = (counts[update.status] ?? 0) + 1;
    }
    return counts;
  }, [afterTextFilters]);

  const options = useMemo(
    () =>
      ISSUE_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: afterTextFilters.filter((u) => u.category === cat.id).length,
      })).filter((option) => option.count > 0 || category === option.id),
    [afterTextFilters, category],
  );

  const visible = afterTextFilters.filter(
    (u) =>
      (category === null || u.category === category) &&
      (stage === null || u.status === stage),
  );

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

      </FilterBar>

      {/* Summary before detail: whether anything is moving, in one glance. */}
      <div className="mt-5 border-b border-line">
        <StageSummary
          counts={stageCounts}
          active={stage}
          onSelect={setStage}
        />
      </div>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "issue" : "issues"}
        {stage || category || query ? " match your filters" : " tracked"}
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
                setStage(null);
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
            const category = ISSUE_CATEGORY_BY_ID[update.category];
            return (
              <li
                key={update.id}
                className="grid gap-x-8 gap-y-2.5 border-b border-line px-3 py-4 transition-colors hover:bg-sunken lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start"
              >
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] leading-snug font-medium text-ink">
                    {update.title}
                  </h3>
                  <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
                    {update.summary}
                  </p>
                  {update.nextStep ? (
                    <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted">
                      <span className="label mr-1.5 text-faint">Next</span>
                      {update.nextStep}
                    </p>
                  ) : null}
                </div>

                {/* The pipeline, drawn as a pipeline. */}
                <div className="flex flex-col gap-2 lg:items-start lg:pt-1">
                  <StageTrack status={update.status} />
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="label text-faint">{category.label}</span>
                    <span className="tnum text-[11px] text-faint">
                      {update.dateLabel}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
