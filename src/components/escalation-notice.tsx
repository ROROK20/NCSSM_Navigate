"use client";

import { useMemo } from "react";
import { ExternalLink } from "./ui";
import { site } from "@/content/site";

/**
 * Appears while someone is typing something that should not go to a student
 * queue.
 *
 * Student Government reads this form on its own schedule. Harassment, a threat,
 * or a student in crisis needs staff who are trained for it and reachable now.
 * Before submissions were stored anywhere this mattered less; a tracker that
 * actually holds reports has to say so at the moment it becomes relevant, not
 * in a paragraph further down the page nobody re-reads.
 *
 * Deliberately non-blocking. It suggests, it does not lock the form: guessing
 * wrong about what someone means and refusing to take it would be worse than
 * showing a route they can ignore.
 */

interface Route {
  match: RegExp;
  heading: string;
  body: string;
  links: { label: string; href: string }[];
}

/*
 * Word-boundary matching, so "classes" does not trigger on "ass" and
 * "threaded" does not trigger on "threat". Stems are deliberate:
 * `harass\w*` covers harassed, harassment, harassing.
 */
const ROUTES: Route[] = [
  {
    match:
      /\b(suicid\w*|kill myself|end my life|self[- ]?harm|hurting myself|cutting myself|want to die|overdose)\b/i,
    heading: "Please talk to someone now, not to this form",
    body: "Nobody monitors this around the clock, and what you are describing should not wait for that.",
    links: [
      { label: "Call or text 988", href: "tel:988" },
      { label: "Durham counseling", href: "https://counseling.ncssm.edu/" },
      {
        label: "What happens in an emergency",
        href: "https://dur-counseling.ncssm.edu/home/psychological-emergenciescare-response",
      },
    ],
  },
  {
    match:
      /\b(harass\w*|assault\w*|sexual\w*|groped?|stalk\w*|discriminat\w*|racist|racism|homophob\w*|transphob\w*)\b/i,
    heading: "There is a formal route for this",
    body: "Title IX and the school's reporting system exist for exactly this, and are handled by staff trained for it. Student Government is not.",
    links: [
      {
        label: "Title IX: how to report",
        href: "https://sites.google.com/a/ncssm.edu/ncssm-title-ix/reporting",
      },
      {
        label: "Advocate: submit a report",
        href: "https://ncssm-advocate.symplicity.com/public_report/index.php/pid750944",
      },
    ],
  },
  {
    match:
      /\b(unsafe|threat\w*|violence|violent|weapon|gun|knife|abus\w*|hit me|hurt me|bull(y|ied|ying))\b/i,
    heading: "This needs staff, not a student queue",
    body: "Campus Safety is staffed around the clock. If someone is in danger right now, call 911 first.",
    links: [
      { label: "Call Campus Safety", href: "tel:+19194162911" },
      {
        label: "Durham emergency info",
        href: "https://www.ncssm.edu/contact/durham-emergency-info",
      },
    ],
  },
  {
    match:
      /\b(worried about (a|my) friend|my friend is|someone is struggling|not eating|panic attack\w*)\b/i,
    heading: "There is a route built for this",
    body: "A CARE report reaches the people who can actually check on someone.",
    links: [
      {
        label: "Submit a CARE report",
        href: "https://ncssm-advocate.symplicity.com/care_report/index.php/pid992479",
      },
      { label: "Durham counseling", href: "https://counseling.ncssm.edu/" },
    ],
  },
];

export function EscalationNotice({ text }: { text: string }) {
  const route = useMemo(() => {
    if (text.trim().length < 6) return null;
    return ROUTES.find((r) => r.match.test(text)) ?? null;
  }, [text]);

  if (!route) return null;

  return (
    <div
      role="status"
      className="rounded-[var(--radius-lg)] border border-[color:var(--danger)]/40 bg-[color:var(--danger-soft)] px-4 py-3.5"
    >
      <p className="text-sm font-semibold text-ink">{route.heading}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        {route.body}
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
        {route.links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("tel:") ? (
              <a href={link.href} className="font-medium text-ink underline underline-offset-2">
                {link.label}
              </a>
            ) : (
              <ExternalLink href={link.href} className="font-medium text-ink">
                {link.label}
              </ExternalLink>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[12px] leading-relaxed text-faint">
        You can still submit this form. It is just not the fastest way to get
        help, and {site.contact.email} is not monitored out of hours.
      </p>
    </div>
  );
}
