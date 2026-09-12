import Link from "next/link";
import { isProposal, proposalLabel, stage } from "@/content/stage";

/**
 * The site-wide honesty strip, shown above everything while Navigate is a
 * proposal rather than an adopted service.
 *
 * It sits above the header instead of inside a page so it cannot be missed by
 * someone who lands deep in the site from a shared link. It disappears
 * entirely once `stage.current` flips to "official".
 */
export function StageBanner() {
  if (!isProposal) return null;

  return (
    <div className="border-b border-[color:var(--warn)]/30 bg-[color:var(--warn-soft)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-[13px] leading-snug sm:px-6">
        <span className="font-semibold text-ink">
          {proposalLabel}
          {stage.candidate.name ? `, running for ${stage.candidate.office}` : ""}.
        </span>
        <span className="text-muted">
          Not an official NCSSM or Student Government service.
        </span>
        <Link
          href="/sg"
          className="ml-auto shrink-0 font-medium text-ink underline underline-offset-2"
        >
          What this is
        </Link>
      </div>
    </div>
  );
}
