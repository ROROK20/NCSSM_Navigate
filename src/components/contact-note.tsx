import type { ReactNode } from "react";

/**
 * The "what to actually do" line on a resource.
 *
 * For a lot of entries the web page is not the answer. The answer is a phone
 * number, an address, or the fact that the clinic shuts at four and after that
 * you go to a Community Coordinator desk. This renders that line and turns
 * anything dialable or emailable into a real link, so on a phone it is one tap
 * rather than something to copy out by hand.
 */

/** US numbers as they appear in this content: 919-416-2911, (919) 416-2892. */
const PATTERN =
  /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4})|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

export function ContactNote({ note }: { note: string }) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of note.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(note.slice(cursor, index));

    const value = match[0];
    const isEmail = value.includes("@");
    parts.push(
      <a
        key={`${index}-${value}`}
        href={
          isEmail
            ? `mailto:${value}`
            : `tel:+1${value.replace(/\D/g, "")}`
        }
        className="font-medium text-accent underline decoration-transparent underline-offset-2 transition hover:decoration-current"
        // The row itself is a link to the official page; stop a tap on the
        // phone number from following that instead.
        onClick={(event) => event.stopPropagation()}
      >
        {value}
      </a>,
    );
    cursor = index + value.length;
  }

  if (cursor < note.length) parts.push(note.slice(cursor));

  return (
    <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
      {parts}
    </p>
  );
}
