import type { Metadata } from "next";
import Link from "next/link";
import { getUpdates } from "@/lib/content";
import { ISSUE_STATUSES, ISSUE_STATUS_BY_ID } from "@/content/taxonomy";
import { UpdatesBoard, type UpdateView } from "@/components/updates-board";
import { Callout, Eyebrow, StatusPip, type StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { isProposal } from "@/content/stage";

export const metadata: Metadata = {
  title: "SG updates",
  description:
    "Public status board for issues NCSSM-Durham Student Government is handling. High-level progress only, with no student details.",
};

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
  const updates = await getUpdates();

  const rows: UpdateView[] = updates.map((update) => ({
    ...update,
    dateLabel: formatDate(update.dateUpdated),
    open: ISSUE_STATUS_BY_ID[update.status]?.open ?? true,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>Status board</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          SG updates
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          What Student Government is working on and where each item stands.
          Entries are written by SG and generalised on purpose.
        </p>
      </header>

      {isProposal ? (
        <div className="mt-6">
          <Callout tone="warn" title="These are examples, not real cases">
            Navigate is a proposal, so nothing here describes an actual student
            report. The entries below are written to show what the board looks
            like in use. No issue reports are being collected yet.
          </Callout>
        </div>
      ) : null}

      <div className="mt-6 mb-2">
        <Callout tone="info" title="What you will not find here">
          Individual submissions are never published. No names, emails, room
          numbers, or quoted descriptions appear on this board, and an entry
          often covers several separate reports about the same thing. An issue
          being listed is not a promise that it will be solved.
          {isProposal ? null : (
            <>
              {" "}
              <Link href="/report">Report an issue</Link> if something is
              missing.
            </>
          )}
        </Callout>
      </div>

      <UpdatesBoard updates={rows} />

      {/* Legend sits after the board: it is reference, not an entry gate. */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label text-faint">What each status means</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {ISSUE_STATUSES.map((status) => (
            <div key={status.id} className="flex flex-col gap-1.5">
              <dt>
                <StatusPip
                  label={status.label}
                  tone={status.tone as StatusTone}
                />
              </dt>
              <dd className="text-sm leading-relaxed text-muted">
                {status.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
