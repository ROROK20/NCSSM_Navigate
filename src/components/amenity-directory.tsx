"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AMENITY_CATEGORIES } from "@/content/taxonomy";
import { scoreMatch } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import {
  Button,
  ButtonLink,
  CategoryTag,
  EmptyState,
  type Tone,
} from "./ui";

/**
 * One physical thing, with its date already formatted on the server.
 *
 * No URL on this row and no link on the title, which is the visible difference
 * between this and every other directory on the site. A row here is a place to
 * walk to, so it gets no hover-to-open affordance that would promise a page.
 */
export interface AmenityView {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  categoryTone: Tone;
  building: string;
  floor: string;
  place: string;
  notes: string;
  aliases: string;
  /** Formatted date, or null when nobody has confirmed it in person. */
  checkedLabel: string | null;
}

export function AmenityDirectory({ amenities }: { amenities: AmenityView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const amenity of amenities) {
      const score = scoreMatch(
        {
          name: amenity.name,
          aliases: amenity.aliases,
          body: [
            amenity.building,
            amenity.floor,
            amenity.place,
            amenity.notes,
            amenity.categoryLabel,
          ]
            .filter(Boolean)
            .join(" "),
        },
        query,
      );
      if (score !== null) map.set(amenity.id, score);
    }
    return map;
  }, [amenities, query]);

  const matched = useMemo(
    () => amenities.filter((amenity) => scores.has(amenity.id)),
    [amenities, scores],
  );

  const options = useMemo(
    () =>
      AMENITY_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: matched.filter((a) => a.category === cat.id).length,
      })),
    [matched],
  );

  const visible = useMemo(() => {
    const rows = category
      ? matched.filter((a) => a.category === category)
      : matched;
    if (query.trim().length === 0) return rows;
    return [...rows].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  }, [matched, category, query, scores]);

  /*
   * Nothing collected yet is a different state from nothing matching a search,
   * and conflating them is how a page ends up offering a search box over an
   * empty set. A search that can only ever fail is theatre, so while the list
   * is empty the controls are not rendered at all.
   */
  if (amenities.length === 0) {
    return (
      <div>
        <EmptyState
          title="Nothing has been logged yet"
          action={
            <ButtonLink href="/report" variant="secondary">
              Tell SG where one is
            </ButtonLink>
          }
        >
          Nobody has walked the buildings and written any of this down, and
          there is no page anywhere to copy it from. Guessing would send someone
          up three flights to a printer that is not there, so this page says
          nothing instead.
        </EmptyState>

        <p className="caveat mt-6 max-w-3xl">
          <strong>Collecting this is a spreadsheet job.</strong> An SG officer
          can run <code className="text-muted">npm run content:export</code>{" "}
          <code className="text-muted">amenities</code> for a blank sheet,
          collect in Google Sheets so several people can walk different
          buildings at once, and import it back. The editing rules are written
          at the top of <code className="text-muted">src/content/amenities.ts</code>.
        </p>
      </div>
    );
  }

  const filtered = query.trim().length > 0 || category !== null;

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search for a printer, a microwave, a building"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={matched.length}
      />

      <p className="caveat mt-4 max-w-3xl">
        <strong>Checked in person, or not at all.</strong> Every row here was
        written down by a student standing in front of the thing. Where no date
        is shown, nobody has confirmed it since it was added.
      </p>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "spot" : "spots"}
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
          This list is only as complete as whoever last walked the buildings. If
          you know of one that is missing,{" "}
          <Link href="/report" className="text-accent underline underline-offset-2">
            tell SG
          </Link>{" "}
          and it gets added.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((amenity) => (
            <AmenityRow key={amenity.id} amenity={amenity} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AmenityRow({ amenity }: { amenity: AmenityView }) {
  const where = [amenity.building, amenity.floor, amenity.place]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="border-b border-line">
      <div className="grid gap-x-8 gap-y-2 px-3 py-3.5 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-baseline">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-snug font-medium text-ink">
            {amenity.name}
          </h3>
          <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
            {where}
          </p>
          {amenity.notes ? (
            <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-muted">
              <span className="label mr-1.5 text-faint">Note</span>
              {amenity.notes}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:flex-col lg:items-start lg:gap-1.5">
          <span className="tnum text-[11px] text-faint">
            {amenity.checkedLabel
              ? `Checked ${amenity.checkedLabel}`
              : "Not checked in person"}
          </span>
          <CategoryTag
            label={amenity.categoryLabel}
            tone={amenity.categoryTone}
          />
        </div>
      </div>
    </li>
  );
}
