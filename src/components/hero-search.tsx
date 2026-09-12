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

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function go(value: string) {
    const trimmed = value.trim();
    router.push(
      trimmed ? `/resources?q=${encodeURIComponent(trimmed)}` : "/resources",
    );
  }

  return (
    <div className="mt-8 max-w-xl">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you need?"
            aria-label="Search resources"
            className="w-full rounded-[var(--radius)] border border-line-strong bg-surface py-3 pr-3 pl-10 text-[15px] text-ink transition-colors placeholder:text-faint hover:border-accent/50 focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-[var(--radius)] bg-accent px-5 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="label text-faint">Try</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              go(example);
            }}
            className="rounded-full border border-line px-2.5 py-1 text-[13px] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
