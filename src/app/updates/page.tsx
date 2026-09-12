import type { Metadata } from "next";
import { getUpdates } from "@/lib/content";
import { ISSUE_STATUSES, ISSUE_STATUS_BY_ID } from "@/content/taxonomy";
import { UpdatesBoard, type UpdateView } from "@/components/updates-board";
import { StageTrack } from "@/components/stage-track";
import { Eyebrow } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { collectsForCandidate, isDemo } from "@/content/stage";
import { DemoSubmissions } from "@/components/demo-submissions";

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
        <h1 className="display mt-3 text-ink">
          SG updates
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          What Student Government is working on and where each item stands.
          Entries are written by SG and generalised on purpose.
        </p>
      </header>

      {/*
        One line, not two stacked slabs. Both facts matter and neither needs a
        tinted box the width of the page above the thing people came to read.
      */}
      <p className="caveat mt-5 max-w-3xl">
        {isDemo ? (
          <>
            <strong>These entries are examples.</strong> Navigate is a
            demonstration, so nothing below describes a real student report.{" "}
          </>
        ) : null}
        <strong>Individual submissions are never published.</strong> No names,
        emails, room numbers, or quoted descriptions appear here, one entry often
        covers several reports about the same thing, and being listed is not a
        promise it will be solved.
      </p>

      {isDemo && !collectsForCandidate ? <DemoSubmissions /> : null}

      <UpdatesBoard updates={rows} />

      {/* Legend sits after the board: it is reference, not an entry gate. */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label text-faint">What each status means</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {ISSUE_STATUSES.map((status) => (
            <div key={status.id} className="flex flex-col gap-1.5">
              <dt>
                <StageTrack status={status.id} />
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
