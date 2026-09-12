"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Resource } from "@/content/types";
import {
  PLATFORM_BY_ID,
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_BY_ID,
} from "@/content/taxonomy";
import { scoreMatch } from "@/lib/search";
import { formatDate } from "@/lib/format";
import { FilterBar } from "./filter-bar";
import { ContactNote } from "./contact-note";
import {
  ArrowUpRight,
  Button,
  CategoryTag,
  Chip,
  EmptyState,
  LockIcon,
  type Tone,
} from "./ui";

/**
 * The resource directory.
 *
 * Rendering happens on the client because search and filtering are instant and
 * the whole dataset is a few kilobytes. If the directory ever grows past a few
 * hundred rows, move the filtering to the server and paginate.
 */
export function ResourceDirectory({
  resources,
  initialQuery = "",
}: {
  resources: Resource[];
  /** Seeded from `?q=` so the homepage search lands on results, not a blank list. */
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string | null>(null);
  const [noLoginOnly, setNoLoginOnly] = useState(false);

  /** Searchable text per row, split by weight. Built once, not per keystroke. */
  const fields = useMemo(() => {
    const map = new Map<string, { name: string; aliases: string; body: string }>();
    for (const resource of resources) {
      map.set(resource.id, {
        name: resource.name,
        aliases: resource.aliases ?? "",
        body: [
          resource.description,
          RESOURCE_CATEGORY_BY_ID[resource.category]?.label,
          resource.audience,
          PLATFORM_BY_ID[resource.platform]?.label,
          resource.contactNote,
        ]
          .filter(Boolean)
          .join(" "),
      });
    }
    return map;
  }, [resources]);

  /** id -> relevance, for the rows that match. Empty query matches everything. */
  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const resource of resources) {
      const score = scoreMatch(
        fields.get(resource.id) ?? { name: resource.name },
        query,
      );
      if (score !== null) map.set(resource.id, score);
    }
    return map;
  }, [resources, fields, query]);

  const afterTextFilters = useMemo(
    () =>
      resources.filter(
        (resource) =>
          scores.has(resource.id) && (!noLoginOnly || !resource.loginRequired),
      ),
    [resources, scores, noLoginOnly],
  );

  /**
   * Counts come from the set filtered by everything *except* category, so the
   * numbers on the chips tell you what selecting one would actually give you.
   */
  const options = useMemo(
    () =>
      RESOURCE_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: afterTextFilters.filter((r) => r.category === cat.id).length,
      })),
    [afterTextFilters],
  );

  const visible = useMemo(() => {
    const rows = category
      ? afterTextFilters.filter((r) => r.category === category)
      : afterTextFilters;
    // While browsing, keep the curated category order. While searching, the
    // best answer belongs at the top.
    if (query.trim().length === 0) return rows;
    return [...rows].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  }, [afterTextFilters, category, query, scores]);

  /** Grouped while browsing, flat while searching. */
  const grouped = query.trim().length === 0;
  const groups = useMemo(() => {
    if (!grouped) return [{ id: null, label: null, rows: visible }];
    return RESOURCE_CATEGORIES.map((cat) => ({
      id: cat.id as string | null,
      label: cat.label as string | null,
      rows: visible.filter((r) => r.category === cat.id),
    })).filter((group) => group.rows.length > 0);
  }, [grouped, visible]);

  const filtered = query.trim().length > 0 || category !== null || noLoginOnly;

  function reset() {
    setQuery("");
    setCategory(null);
    setNoLoginOnly(false);
  }

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search resources, offices, and forms"
        options={options}
        active={category}
        onActiveChange={setCategory}
        totalCount={afterTextFilters.length}
      >
        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={noLoginOnly}
            onChange={(event) => setNoLoginOnly(event.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Only show things I can open without signing in
        </label>
      </FilterBar>

      {/*
        Both caveats, in one line, immediately under the controls. They were a
        paragraph and a tinted slab above the search; that made the honesty note
        the most prominent element on a page about finding things.
      */}
      <p className="caveat mt-4 max-w-3xl">
        Links marked <strong>NCSSM login</strong> open the school&rsquo;s own
        sign-in; Navigate never asks for your password.{" "}
        <strong>Checked by machine, not yet by a person:</strong> every link is
        tested automatically, but nobody has confirmed each one leads to the
        right page. Check anything important against the official source.
      </p>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "resource" : "resources"}
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
            <Button variant="secondary" onClick={reset}>
              Clear filters
            </Button>
          }
        >
          Try a shorter search, or clear the filters. If it genuinely is not
          here,{" "}
          <Link href="/report" className="text-accent underline underline-offset-2">
            tell SG
          </Link>{" "}
          and it gets added.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.id ?? "all"} aria-label={group.label ?? "Results"}>
              {group.label ? (
                <h2 className="label border-b border-line pb-2 text-faint">
                  {group.label}
                  <span className="tnum ml-2 opacity-60">
                    {group.rows.length}
                  </span>
                </h2>
              ) : null}
              <ul className={group.label ? "" : "border-t border-line"}>
                {group.rows.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  const category = RESOURCE_CATEGORY_BY_ID[resource.category];
  const platform = PLATFORM_BY_ID[resource.platform];
  const external = resource.officialUrl.startsWith("http");
  const verified = formatDate(resource.lastVerified);

  /*
   * Three tracks on a wide screen: what it is, what it costs you to open, and
   * where it sits. The row used to be one narrow column with the category tag
   * floating in a 600px gutter, so a 1440px window carried the same amount of
   * information as a 900px one.
   *
   * Only the title is a link. The contact note holds tappable phone numbers and
   * an anchor cannot nest, and it gives the link an accessible name of
   * "Campus Safety & Security" rather than the whole row read as one string.
   */
  const titleClass =
    "text-[1.0625rem] font-medium leading-snug text-ink underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:text-accent hover:decoration-current";

  return (
    <li className="group border-b border-line transition-colors duration-150 hover:bg-sunken">
      <div className="grid gap-x-8 gap-y-2 px-3 py-3.5 lg:grid-cols-[minmax(0,1fr)_9.5rem_11rem] lg:items-baseline">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {external ? (
              <a
                href={resource.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={titleClass}
              >
                {resource.name}
              </a>
            ) : (
              <Link href={resource.officialUrl} className={titleClass}>
                {resource.name}
              </Link>
            )}
            {external ? (
              <ArrowUpRight className="shrink-0 translate-y-px text-faint transition-colors group-hover:text-accent" />
            ) : null}
            {resource.verificationStatus === "outdated" ? (
              <Chip tone="danger">Link may be out of date</Chip>
            ) : null}
          </div>

          <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
            {resource.description}
          </p>

          {resource.contactNote ? (
            <ContactNote note={resource.contactNote} />
          ) : null}
        </div>

        {/* Middle rail: what opening this will ask of you. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:flex-col lg:items-start lg:gap-1">
          {resource.loginRequired ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--warn)]">
              <LockIcon />
              NCSSM login
            </span>
          ) : (
            <span className="text-[11px] text-faint">No sign-in</span>
          )}
          {platform ? (
            <span className="text-[11px] text-faint">{platform.label}</span>
          ) : null}
          {verified ? (
            <span className="tnum text-[11px] text-faint">
              Checked {verified}
            </span>
          ) : null}
        </div>

        <CategoryTag
          label={category.label}
          tone={category.tone as Tone}
          className="lg:justify-self-start"
        />
      </div>
    </li>
  );
}
