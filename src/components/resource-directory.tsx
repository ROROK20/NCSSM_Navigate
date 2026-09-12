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
import { cn } from "@/lib/cn";
import { FilterBar } from "./filter-bar";
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

  const meta = [
    resource.audience,
    platform?.label,
    verified ? `Checked ${verified}` : null,
  ].filter(Boolean);

  const inner = (
    <>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-ink group-hover:text-accent">
            {resource.name}
          </span>
          {external ? <ArrowUpRight className="text-faint" /> : null}
          {resource.loginRequired ? (
            <Chip icon={<LockIcon />}>NCSSM login required</Chip>
          ) : null}
          {resource.verificationStatus === "outdated" ? (
            <Chip tone="danger">Link may be out of date</Chip>
          ) : null}
        </div>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          {resource.description}
        </p>
        {resource.contactNote ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-faint">
            {resource.contactNote}
          </p>
        ) : null}
        {meta.length > 0 ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-faint">
            {meta.map((item, i) => (
              <span key={item as string}>
                {i > 0 ? <span className="mr-2 opacity-50">·</span> : null}
                {item}
              </span>
            ))}
          </p>
        ) : null}
      </div>
      <CategoryTag
        label={category.label}
        tone={category.tone as Tone}
        className="shrink-0 pt-0.5 sm:w-44"
      />
    </>
  );

  const className = cn(
    "group flex flex-col gap-2 py-4 transition-colors hover:bg-sunken",
    "sm:-mx-3 sm:flex-row sm:items-start sm:gap-6 sm:px-3",
  );

  return (
    <li className="border-b border-line">
      {external ? (
        <a
          href={resource.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {inner}
        </a>
      ) : (
        <Link href={resource.officialUrl} className={className}>
          {inner}
        </Link>
      )}
    </li>
  );
}
