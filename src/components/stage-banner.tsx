import Link from "next/link";
import { isDemo, stage } from "@/content/stage";

/**
 * The demo marker, shown above everything while Navigate is a demonstration
 * rather than an adopted service.
 *
 * Deliberately not styled as a warning. The site works; the point of the strip
 * is to set expectations before someone reaches the issue form, not to
 * apologise. It sits above the header rather than inside a page so it survives
 * someone landing deep in the site from a shared link, and it disappears
 * entirely once `stage.current` flips to "official".
 */
export function StageBanner() {
  if (!isDemo) return null;

  const { name, office } = stage.candidate;

  return (
    <div
      data-demo-banner
      className="border-b border-[color:var(--accent)]/25 bg-accent-soft"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-[13px] leading-snug sm:px-6">
        <span className="inline-flex shrink-0 items-center rounded border border-[color:var(--accent)]/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.09em] text-accent uppercase">
          Demo
        </span>
        {/*
          Full sentence where there is room; the half that actually matters on a
          phone, where this strip was taking three lines above the fold.
        */}
        <span className="text-ink sm:hidden">Nothing you submit is sent.</span>
        <span className="hidden text-ink sm:inline">
          Everything here works. Nothing you submit is sent, stored, or seen by
          anyone.
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {name ? (
            <span className="hidden text-muted sm:inline">
              {name} &middot; running for {office}
            </span>
          ) : null}
          <Link
            href="/sg"
            className="font-medium text-ink underline underline-offset-2"
          >
            What this is
          </Link>
        </span>
      </div>
    </div>
  );
}
