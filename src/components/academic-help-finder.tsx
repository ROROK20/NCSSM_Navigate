"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { scoreMatch } from "@/lib/search";
import { FilterBar } from "./filter-bar";
import { ArrowUpRight, Button, EmptyState, LockIcon } from "./ui";

/**
 * One route to a person, resolved on the server.
 *
 * The finder never reads `resources.ts` itself. It is handed finished rows, so
 * a resource an editor hides in /admin disappears from here too without this
 * component knowing that overrides exist.
 */
export interface HelpRouteView {
  id: string;
  name: string;
  description: string;
  url: string;
  external: boolean;
  loginRequired: boolean;
  who: string;
  gives: string;
  /** Resource aliases, group aliases, and route aliases, already joined. */
  aliases: string;
}

export interface HelpGroupView {
  id: string;
  label: string;
  blurb: string;
  routes: HelpRouteView[];
}

export function AcademicHelpFinder({
  groups,
  examples,
}: {
  groups: HelpGroupView[];
  examples: string[];
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  /** Flat list of every route, tagged with the group it came from. */
  const routes = useMemo(
    () =>
      groups.flatMap((g) =>
        g.routes.map((route) => ({ ...route, groupId: g.id, groupLabel: g.label })),
      ),
    [groups],
  );

  const scores = useMemo(() => {
    const map = new Map<string, number>();
    for (const route of routes) {
      const score = scoreMatch(
        {
          name: route.name,
          aliases: route.aliases,
          body: [route.description, route.groupLabel, route.who, route.gives].join(
            " ",
          ),
        },
        query,
      );
      if (score !== null) map.set(route.id, score);
    }
    return map;
  }, [routes, query]);

  const matched = useMemo(
    () => routes.filter((route) => scores.has(route.id)),
    [routes, scores],
  );

  const options = useMemo(
    () =>
      groups.map((g) => ({
        id: g.id,
        label: g.label,
        count: matched.filter((route) => route.groupId === g.id).length,
      })),
    [groups, matched],
  );

  const visible = useMemo(() => {
    const rows = group
      ? matched.filter((route) => route.groupId === group)
      : matched;
    // Browsing keeps the curated subject order. Searching puts the best answer
    // first, because a search is a question and this is the reply.
    if (query.trim().length === 0) return rows;
    return [...rows].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    );
  }, [matched, group, query, scores]);

  const browsing = query.trim().length === 0;
  const sections = useMemo(() => {
    if (!browsing) return [{ id: "results", label: null, blurb: null, rows: visible }];
    return groups
      .map((g) => ({
        id: g.id,
        label: g.label as string | null,
        blurb: g.blurb as string | null,
        rows: visible.filter((route) => route.groupId === g.id),
      }))
      .filter((section) => section.rows.length > 0);
  }, [browsing, groups, visible]);

  const filtered = query.trim().length > 0 || group !== null;

  function reset() {
    setQuery("");
    setGroup(null);
  }

  return (
    <div>
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by subject, or by what you are stuck on"
        options={options}
        active={group}
        onActiveChange={setGroup}
        totalCount={matched.length}
      >
        {/*
          The same demonstration the homepage makes. Each chip is a sentence
          nobody would guess works, and it works because of an aliases field
          that is invisible on the page.
        */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="label text-faint">Try</span>
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                setGroup(null);
              }}
              className="rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {example}
            </button>
          ))}
        </div>
      </FilterBar>

      <p className="caveat mt-4 max-w-3xl">
        Every route here is an existing NCSSM page, listed under the subject its
        link actually serves.{" "}
        <strong>Checked by machine, not yet by a person:</strong> the links are
        tested automatically, but the times on the other side are set by whoever
        holds the hours. Check the page before you walk over.
      </p>

      <p aria-live="polite" className="py-4 text-sm text-faint">
        {visible.length} {visible.length === 1 ? "route" : "routes"}
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
            <Button variant="secondary" onClick={reset}>
              Clear search
            </Button>
          }
        >
          Try the subject name on its own. If no route here covers it, the full{" "}
          <Link
            href="/resources"
            className="text-accent underline underline-offset-2"
          >
            resource directory
          </Link>{" "}
          is wider than this page.
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} aria-label={section.label ?? "Results"}>
              {section.label ? (
                <div className="border-b border-line pb-2">
                  <h2 className="label text-faint">
                    {section.label}
                    <span className="tnum ml-2 font-normal text-faint">
                      {section.rows.length}
                    </span>
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
                    {section.blurb}
                  </p>
                </div>
              ) : null}
              <ul className={section.label ? "" : "border-t border-line"}>
                {section.rows.map((route) => (
                  <RouteRow key={route.id} route={route} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteRow({ route }: { route: HelpRouteView }) {
  const titleClass =
    "text-[1.0625rem] font-medium leading-snug text-ink underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:text-accent hover:decoration-current";

  return (
    <li className="group border-b border-line transition-colors duration-150 hover:bg-sunken">
      <div className="grid gap-x-8 gap-y-2 px-3 py-3.5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-baseline">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {route.external ? (
              <a
                href={route.url}
                target="_blank"
                rel="noopener noreferrer"
                className={titleClass}
              >
                {route.name}
              </a>
            ) : (
              <Link href={route.url} className={titleClass}>
                {route.name}
              </Link>
            )}
            {route.external ? (
              <ArrowUpRight className="shrink-0 translate-y-px text-faint transition-colors group-hover:text-accent" />
            ) : null}
          </div>
          <p className="mt-1 max-w-[62ch] text-[0.875rem] leading-relaxed text-muted">
            {route.description}
          </p>
        </div>

        {/*
          Who is on the other end, and what opening it actually gives you.

          Stacked at every width rather than wrapping inline like the resource
          directory's rail. Those values are tokens ("No sign-in", "Canvas");
          these are short sentences, and flowing sentences inline put the login
          marker halfway along a line on a phone.
        */}
        <dl className="flex flex-col gap-1">
          <div className="flex gap-1.5">
            <dt className="label shrink-0 text-faint">Who</dt>
            <dd className="text-[13px] text-muted">{route.who}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="label shrink-0 text-faint">Opens</dt>
            <dd className="text-[13px] text-muted">{route.gives}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="sr-only">Sign-in</dt>
            <dd>
              {route.loginRequired ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--warn)]">
                  <LockIcon />
                  NCSSM login
                </span>
              ) : (
                <span className="text-[11px] text-faint">No sign-in</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
