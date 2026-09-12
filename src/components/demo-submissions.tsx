"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ISSUE_CATEGORY_BY_ID, ISSUE_STATUS_BY_ID } from "@/content/taxonomy";
import {
  clearDemoSubmissions,
  getDemoSubmissions,
  getDemoSubmissionsOnServer,
  subscribeDemoSubmissions,
} from "@/lib/demo-store";
import { Button, StatusPip, type StatusTone } from "./ui";

/**
 * Anything the visitor submitted during this demo, shown above the board.
 *
 * This closes the loop - submit a report, watch it appear - which is the part
 * of the product a screenshot cannot convey. It also demonstrates the privacy
 * model rather than contradicting it: the row says out loud that a real
 * submission is never published, and that this one never left the browser.
 */
export function DemoSubmissions() {
  // The server snapshot is always empty, so the first client render matches
  // the HTML and React swaps in the stored rows without a hydration mismatch.
  const rows = useSyncExternalStore(
    subscribeDemoSubmissions,
    getDemoSubmissions,
    getDemoSubmissionsOnServer,
  );

  if (rows.length === 0) return null;

  const received = ISSUE_STATUS_BY_ID.received;

  return (
    <section
      aria-labelledby="demo-submissions-heading"
      className="mt-8 rounded-[var(--radius-lg)] border border-[color:var(--accent)]/30 bg-accent-soft p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label text-accent">Your demo submission</p>
          <h2
            id="demo-submissions-heading"
            className="mt-2 text-lg font-semibold tracking-tight text-ink"
          >
            {rows.length === 1
              ? "This is what you just submitted"
              : `${rows.length} things you submitted`}
          </h2>
        </div>
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          onClick={clearDemoSubmissions}
        >
          Clear
        </Button>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Only you can see this. It never left your browser, and clearing it
        removes every trace.{" "}
        <strong className="font-medium text-ink">
          In the real thing this would not appear here at all
        </strong>{" "}
        — an officer would read it privately and write a generalised entry for
        the board below, with no names, quotes, or room numbers.
      </p>

      <ul className="mt-5 border-t border-[color:var(--accent)]/20">
        {rows.map((row) => {
          const category = ISSUE_CATEGORY_BY_ID[row.category];
          return (
            <li
              key={row.id}
              className="border-b border-[color:var(--accent)]/20 py-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <StatusPip
                  label={received.label}
                  tone={received.tone as StatusTone}
                />
                <span className="label text-faint">
                  {category?.label ?? row.category}
                </span>
                {row.anonymous ? (
                  <span className="label text-faint">Anonymous</span>
                ) : null}
              </div>
              <h3 className="mt-2.5 font-semibold text-ink">{row.title}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-muted">
                {row.description}
              </p>
              {row.location ? (
                <p className="mt-2 text-xs text-faint">{row.location}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-muted">
        <Link href="/report" className="font-medium text-accent">
          Submit another
        </Link>
      </p>
    </section>
  );
}
