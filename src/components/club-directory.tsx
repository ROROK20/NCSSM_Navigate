"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CLUB_CATEGORIES } from "@/content/taxonomy";
import { scoreMatch } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import {
  ArrowUpRight,
  Button,
  ButtonLink,
  CategoryTag,
  EmptyState,
  type Tone,
} from "./ui";

export interface ClubView {
  id: string;
  name: string;
  does: string;
  category: string;
  categoryLabel: string;
  categoryTone: Tone;
  frequency: string;
  meets: string;
  location: string;
  contactEmail: string;
  instagram: string;
  /** Built from the handle on the server, so no address is stored. */
  instagramUrl: string | null;
  aliases: string;
}

export function ClubDirectory({ clubs }: { clubs: ClubView[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const club of clubs) {
      const score = scoreMatch(
        {
          name: club.name,
          /*
           * What the club does is scored as an alias, not as body text.
           *
           * Nobody searches for "Mu Alpha Theta". They search for "math
           * competitions", and at body weight that hit ranks below any club
           * with the word "math" in its name whether or not it competes.
           */
          aliases: [club.aliases, club.does].filter(Boolean).join(" "),
          body: [
            club.categoryLabel,
            club.location,
            club.frequency,
            club.meets,
          ]
            .filter(Boolean)
            .join(" "),
        },
        query,
      );
      if (score !== null) map.set(club.id, score);
    }
    return map;
  }, [clubs, query]);

  const matched = useMemo(
    () => clubs.filter((club) => scores.has(club.id)),
    [clubs, scores],
  );

  const options = useMemo(
    () =>
      CLUB_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: matched.filter((c) => c.category === cat.id).length,
      })),
    [matched],
  );

  const visible = useMemo(() => {
    const rows = category
      ? matched.filter((c) => c.category === category)
      : matched;
    if (query.trim().length === 0) {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...rows].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  }, [matched, category, query, scores]);

  // Nothing collected is a different state from nothing matching, and a search
  // box over an empty set can only ever disappoint.
  if (clubs.length === 0) {
    return (
      <div>
        <EmptyState
          title="No clubs listed yet"
          action={
            <ButtonLink href="/resources?q=clubs" variant="secondary">
              The school&rsquo;s own clubs page
            </ButtonLink>
          }
        >
          Nobody has collected the clubs, their meeting times, or their contacts
          yet. A plausible-sounding club is worse than none: someone emails an
          address nobody reads, or turns up on a Tuesday to an empty room.
        </EmptyState>

        <p className="caveat mt-6 max-w-3xl">
          <strong>Officers can fill their own row.</strong> An SG officer runs{" "}
          <code className="text-muted">npm run content:export clubs</code> for a
          blank sheet, shares it so each club completes its own line, and
          imports it back. The editing rules are at the top of{" "}
          <code className="text-muted">src/content/clubs.ts</code>.
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
        placeholder="Search by what a club does, not just its name"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={matched.length}
      />

      <p className="caveat mt-4 max-w-3xl">
        <strong>Maintained by the clubs themselves.</strong> Meeting times and
        contacts are whatever each club last wrote down, and officers change
        every year. Email before you rely on a time here.
      </p>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "club" : "clubs"}
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
          Try what the club would do rather than what it might be called. If it
          is genuinely missing,{" "}
          <Link href="/report" className="text-accent underline underline-offset-2">
            tell SG
          </Link>{" "}
          and it gets added.
        </EmptyState>
      ) : (
        <ul className="border-t border-line">
          {visible.map((club) => (
            <ClubRow key={club.id} club={club} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClubRow({ club }: { club: ClubView }) {
  // Empty renders as "Not listed" rather than as a blank, so a gap in the data
  // reads as a gap rather than as "this club does not meet anywhere".
  const when = [club.frequency, club.meets].filter(Boolean).join(" · ");

  return (
    <li className="border-b border-line">
      <div className="grid gap-x-8 gap-y-2 px-3 py-3.5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-baseline">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-snug font-medium text-ink">
            {club.name}
          </h3>
          <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
            {club.does}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            {club.contactEmail ? (
              <a
                href={`mailto:${club.contactEmail}`}
                className="text-[13px] font-medium text-accent underline decoration-transparent underline-offset-2 transition hover:decoration-current"
              >
                {club.contactEmail}
              </a>
            ) : null}
            {club.instagramUrl ? (
              <a
                href={club.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-accent underline decoration-transparent underline-offset-2 transition hover:decoration-current"
              >
                @{club.instagram}
                <ArrowUpRight />
              </a>
            ) : null}
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-1.5">
          <div className="flex gap-1.5">
            <dt className="label shrink-0 text-faint">Meets</dt>
            <dd className="text-[13px] text-muted">{when || "Not listed"}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="label shrink-0 text-faint">Where</dt>
            <dd className="text-[13px] text-muted">
              {club.location || "Not listed"}
            </dd>
          </div>
          <CategoryTag label={club.categoryLabel} tone={club.categoryTone} />
        </dl>
      </div>
    </li>
  );
}
