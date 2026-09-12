"use client";

import { useMemo, useState } from "react";
import type { Opportunity } from "@/content/types";
import {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_CATEGORY_BY_ID,
} from "@/content/taxonomy";
import { matchesQuery } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import {
  ArrowUpRight,
  Button,
  CategoryTag,
  Chip,
  EmptyState,
  type Tone,
} from "./ui";

/**
 * An opportunity plus the date facts, computed on the server.
 *
 * Anything that depends on "now" is resolved before this reaches the browser.
 * Deriving it here instead would make the server and client render differently
 * whenever the two clocks disagree, which React reports as a hydration error.
 */
export interface OpportunityView extends Opportunity {
  isPast: boolean;
  whenLabel: string | null;
  countdownLabel: string | null;
  monthLabel: string | null;
  dayLabel: string | null;
}

export function OpportunityDirectory({ items }: { items: OpportunityView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const haystacks = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(
        item.id,
        [
          item.title,
          item.description,
          OPPORTUNITY_CATEGORY_BY_ID[item.category]?.label,
          item.location,
          item.eligibility,
          item.source,
          item.cost,
        ]
          .filter(Boolean)
          .join(" "),
      );
    }
    return map;
  }, [items]);

  const afterTextFilters = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesQuery(haystacks.get(item.id) ?? "", query) &&
          (showPast || !item.isPast),
      ),
    [items, haystacks, query, showPast],
  );

  const options = useMemo(
    () =>
      OPPORTUNITY_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: afterTextFilters.filter((i) => i.category === cat.id).length,
      })),
    [afterTextFilters],
  );

  const visible = useMemo(() => {
    const rows = category
      ? afterTextFilters.filter((i) => i.category === category)
      : afterTextFilters;
    // Soonest first; undated "rolling" entries sink below anything scheduled.
    return [...rows].sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
      if (!a.date && !b.date) return a.title.localeCompare(b.title);
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.isPast ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    });
  }, [afterTextFilters, category]);

  const pastCount = items.filter((i) => i.isPast).length;
  const filtered = query.trim().length > 0 || category !== null;

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search opportunities, locations, and organisers"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={afterTextFilters.length}
      >
        {pastCount > 0 ? (
          <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-muted">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(event) => setShowPast(event.target.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Include {pastCount} past {pastCount === 1 ? "entry" : "entries"}
          </label>
        ) : null}
      </FilterBar>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length}{" "}
        {visible.length === 1 ? "opportunity" : "opportunities"}
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
                setCategory(null);
              }}
            >
              Clear filters
            </Button>
          }
        >
          Opportunities are added by hand, so the list is never complete. If you
          know about something good, send it to SG.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((item) => (
            <OpportunityRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OpportunityRow({ item }: { item: OpportunityView }) {
  const category = OPPORTUNITY_CATEGORY_BY_ID[item.category];

  return (
    <li className="border-b border-line py-5">
      <div className="flex gap-4 sm:gap-6">
        {/* Date block: a departure-board mark, not a decorative badge. */}
        <div
          className="tnum w-14 shrink-0 text-center sm:w-16"
          aria-hidden={item.date ? undefined : "true"}
        >
          {item.date ? (
            <>
              <span
                className="label block"
                style={{ color: item.isPast ? "var(--ink-faint)" : "var(--accent)" }}
              >
                {item.monthLabel}
              </span>
              <span className="block text-2xl leading-tight font-semibold text-ink">
                {item.dayLabel}
              </span>
            </>
          ) : (
            <span className="label block pt-1 text-faint">Ongoing</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold text-ink">{item.title}</h3>
            {item.dateKind === "deadline" ? (
              <Chip tone="warn">Deadline</Chip>
            ) : null}
            {item.isPast ? <Chip>Passed</Chip> : null}
            {!item.verified ? <Chip tone="warn">Unverified</Chip> : null}
          </div>

          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {item.description}
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-faint">
            <Detail label="When">
              {item.whenLabel ?? "Ongoing"}
              {item.countdownLabel ? ` · ${item.countdownLabel}` : ""}
            </Detail>
            <Detail label="Where">{item.location}</Detail>
            <Detail label="Cost">{item.cost}</Detail>
            <Detail label="Who">{item.eligibility}</Detail>
            <Detail label="Source">{item.source}</Detail>
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            {item.registrationUrl ? (
              <a
                href={item.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline decoration-transparent underline-offset-[3px] transition hover:decoration-current"
              >
                Registration & details
                <ArrowUpRight />
              </a>
            ) : (
              <span className="text-sm text-faint">
                No registration link on file
              </span>
            )}
            <CategoryTag label={category.label} tone={category.tone as Tone} />
          </div>
        </div>
      </div>
    </li>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1.5">
      <dt className="label text-faint">{label}</dt>
      <dd className="text-muted">{children}</dd>
    </div>
  );
}
