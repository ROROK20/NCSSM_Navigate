"use client";

import { useMemo, useState } from "react";
import { DISCOUNT_CATEGORIES } from "@/content/taxonomy";
import { scoreMatch } from "@/lib/search";
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
 * A business with its map link already built, resolved on the server.
 *
 * `terms` empty and `studentIdRequired` null are the normal case today, not an
 * error state. Both render as an explicit "not confirmed" rather than as a
 * blank, because a blank reads as "no conditions".
 */
export interface DiscountView {
  id: string;
  name: string;
  kind: string;
  category: string;
  categoryLabel: string;
  categoryTone: Tone;
  mapsUrl: string;
  /** The business's own site. Empty for most of them. */
  website: string;
  terms: string;
  studentIdRequired: boolean | null;
  aliases: string;
}

export function DiscountDirectory({ discounts }: { discounts: DiscountView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const discount of discounts) {
      const score = scoreMatch(
        {
          name: discount.name,
          aliases: discount.aliases,
          body: [discount.kind, discount.categoryLabel, discount.terms]
            .filter(Boolean)
            .join(" "),
        },
        query,
      );
      if (score !== null) map.set(discount.id, score);
    }
    return map;
  }, [discounts, query]);

  const matched = useMemo(
    () => discounts.filter((discount) => scores.has(discount.id)),
    [discounts, scores],
  );

  /* With a list this short the chip counts double as the menu of what is on
     offer, which is the one thing about these places that IS confirmed. */
  const options = useMemo(
    () =>
      DISCOUNT_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: matched.filter((d) => d.category === cat.id).length,
      })),
    [matched],
  );

  const visible = useMemo(() => {
    const rows = category
      ? matched.filter((d) => d.category === category)
      : matched;
    if (query.trim().length === 0) return rows;
    return [...rows].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  }, [matched, category, query, scores]);

  const filtered = query.trim().length > 0 || category !== null;

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by name or by what you feel like eating"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={matched.length}
      />

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "place" : "places"}
        {filtered
          ? visible.length === 1
            ? " matches your search"
            : " match your search"
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
          The list is only what the SG discounts committee has collected so far.
          If you know a place that gives students a discount, tell SG and it
          gets added.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((discount) => (
            <DiscountRow key={discount.id} discount={discount} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DiscountRow({ discount }: { discount: DiscountView }) {
  const confirmed = discount.terms.trim().length > 0;

  return (
    <li className="group border-b border-line transition-colors duration-150 hover:bg-sunken">
      <div className="grid gap-x-8 gap-y-2 px-3 py-3.5 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-baseline">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <a
              href={discount.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[1.0625rem] font-medium leading-snug text-ink underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:text-accent hover:decoration-current"
            >
              {discount.name}
            </a>
            <ArrowUpRight className="shrink-0 translate-y-px text-faint transition-colors group-hover:text-accent" />
            {confirmed ? null : <Chip tone="warn">Terms not confirmed yet</Chip>}
          </div>

          <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
            {discount.kind}
          </p>

          {/*
            The whole point of the page, so it is a sentence rather than a
            dash. A student who reads "10%" and is refused at the counter has
            been let down by this site, not by the shop.

            When it is unknown this line carries the ACTION rather than
            repeating the chip above it: seven rows each saying "not confirmed"
            twice turned the page's one honest fact into wallpaper.
          */}
          <p className="mt-2 max-w-[62ch] text-[13px] leading-relaxed text-muted">
            <span className="label mr-1.5 text-faint">Discount</span>
            {confirmed
              ? discount.terms
              : "Ask at the counter. SG has the name but not the deal."}
          </p>

          {/*
            Only where the business has a page of its own. Maps already carries
            hours, phone and photos, so this earns its place by going to a
            menu, and most rows correctly have nothing here.
          */}
          {discount.website ? (
            <a
              href={discount.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-accent underline decoration-transparent underline-offset-2 transition hover:decoration-current"
            >
              Their own site
              <ArrowUpRight />
            </a>
          ) : null}
        </div>

        {/* The tag sits beside the list, not inside it: a `dl` may only
            directly contain dt/dd groups, and axe is right to say so. */}
        <div className="flex flex-wrap items-start gap-x-5 gap-y-1.5 lg:flex-col lg:gap-1.5">
          <dl className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-1.5">
            <div className="flex gap-1.5">
              <dt className="label shrink-0 text-faint">ID</dt>
              <dd className="text-[13px] text-muted">
                {discount.studentIdRequired === null
                  ? "Not confirmed"
                  : discount.studentIdRequired
                    ? "Bring your student ID"
                    : "Not needed"}
              </dd>
            </div>
          </dl>
          <CategoryTag
            label={discount.categoryLabel}
            tone={discount.categoryTone}
          />
        </div>
      </div>
    </li>
  );
}
