import { readinessOf } from "@/content/readiness";
import { StatusPip } from "./ui";

/**
 * The at-a-glance answer to "is this real?".
 *
 * Reuses the status pip the issue tracker already uses, so a reader who has
 * seen one has seen both, and so the colours stay inside the set that was
 * contrast-checked in both themes.
 *
 * Renders nothing for a route with no entry. A page nobody has judged should
 * not claim a status.
 */
export function ReadinessTag({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const readiness = readinessOf(href);
  if (!readiness) return null;
  return (
    <StatusPip
      label={readiness.label}
      tone={readiness.tone}
      className={className}
    />
  );
}

/**
 * The tag plus its one-line caveat, for the top of the page it describes.
 *
 * The note is the part that does the work. "Working now" beside a heading is a
 * claim; "the seven businesses are real, what each discount is has not been
 * confirmed" is the claim a reader can actually check.
 */
export function ReadinessLine({ href }: { href: string }) {
  const readiness = readinessOf(href);
  if (!readiness) return null;
  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
      <ReadinessTag href={href} />
      {readiness.note ? (
        <span className="caveat max-w-2xl">{readiness.note}</span>
      ) : null}
    </div>
  );
}
