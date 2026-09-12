"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./ui";

/**
 * The search that starts on the homepage and lands on the directory.
 *
 * The hero used to be a headline and two buttons over a lot of empty space.
 * A student arriving here has a specific question, so the most useful thing to
 * put in front of them is the question box itself.
 *
 * The examples are not decoration either: each one is a plain-language phrase
 * that only resolves because of the `aliases` field on the resource it finds.
 * Tapping one demonstrates the single best thing this site does, without
 * anybody having to explain it.
 */
const EXAMPLES = [
  "stressed",
  "broken dryer",
  "transcript",
  "rec letter",
  "wifi",
];

export function HeroSearch({ total }: { total: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function go(value: string) {
    const trimmed = value.trim();
    router.push(
      trimmed ? `/resources?q=${encodeURIComponent(trimmed)}` : "/resources",
    );
  }

  return (
    <div className="mt-8 max-w-lg">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-board-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you need?"
            aria-label="Search resources"
            className="w-full rounded-[var(--radius)] border border-board-line bg-white/[0.06] py-3.5 pr-3 pl-11 text-base text-board-ink transition-colors placeholder:text-board-faint hover:border-board-accent/60 focus:border-board-accent focus:bg-white/[0.09]"
          />
        </div>
        <button
          type="submit"
          className="rounded-[var(--radius)] bg-board-accent px-5 py-3.5 text-sm font-semibold text-board transition-colors hover:brightness-110"
        >
          Search
        </button>
      </form>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="label text-board-faint">Try</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              go(example);
            }}
            className="rounded-full border border-board-line px-2.5 py-1 text-[13px] text-board-muted transition-colors hover:border-board-accent hover:text-board-accent"
          >
            {example}
          </button>
        ))}
      </div>

      {/*
        One line of proof, kept deliberately quiet. The left column ended above
        the shortlist beside it and left a hole; this is the argument for the
        site anyway, and it belongs next to the search rather than a screen
        further down.
      */}
      <p className="mt-7 border-t border-board-line pt-4 text-[13px] leading-relaxed text-board-faint">
        <span className="tnum font-semibold text-board-ink">{total}</span>{" "}
        resources across every NCSSM system, from the clinic booking form to the
        faculty office hours sheet. Every link tested; none broken.
      </p>
    </div>
  );
}
