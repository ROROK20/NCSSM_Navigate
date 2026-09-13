import { ReadinessTag } from "@/components/readiness-tag";
import type { Metadata } from "next";
import Link from "next/link";
import { getSgFeed } from "@/lib/content";
import {
  SG_FEED_KIND_BY_ID,
  SG_PROPOSAL_STAGES,
  SG_PROPOSAL_STAGE_BY_ID,
} from "@/content/taxonomy";
import { SgFeedBoard, type SgFeedView } from "@/components/sg-feed-board";
import {
  Callout,
  Eyebrow,
  StatusPip,
  type StatusTone,
  type Tone,
} from "@/components/ui";
import { dateParts, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "SG transparency",
  description:
    "What NCSSM-Durham Student Government itself is doing: meeting highlights, policy proposals and where each stands, and responses to student feedback.",
};

// Entries come from a spreadsheet officers edit, so the page has to read them
// per request rather than baking them in at build time.
export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const feed = await getSgFeed();

  const entries: SgFeedView[] = feed.map((entry) => {
    const kind = SG_FEED_KIND_BY_ID[entry.kind];
    const stage = entry.stage ? SG_PROPOSAL_STAGE_BY_ID[entry.stage] : null;
    const parts = dateParts(entry.date);
    return {
      id: entry.id,
      kind: entry.kind,
      kindLabel: kind.label,
      kindTone: kind.tone as Tone,
      title: entry.title,
      body: entry.body,
      stageLabel: stage?.label ?? null,
      stageTone: (stage?.tone as StatusTone) ?? null,
      example: entry.example,
      monthLabel: parts?.month ?? null,
      dayLabel: parts?.day ?? null,
      dateLabel: formatDate(entry.date),
    };
  });

  const examples = entries.filter((entry) => entry.example).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Eyebrow>Student Government</Eyebrow>
          <ReadinessTag href="/transparency" />
        </div>
        <h1 className="display mt-3 text-ink">SG transparency</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          What Student Government itself is doing: what came up at meetings,
          what it is trying to change and how far that has got, and what it said
          back when students raised something.
        </p>
      </header>

      {/*
        The two boards are one click apart and easily confused, so each says
        what the other is rather than leaving a student to work it out.
      */}
      <p className="caveat mt-5 max-w-3xl">
        This follows Student Government. For a problem somebody reported and
        where it has got to, the{" "}
        <Link href="/updates" className="text-accent underline underline-offset-2">
          issue tracker
        </Link>{" "}
        is the other board.
      </p>

      {examples > 0 ? (
        <div className="mt-5">
          <Callout
            tone="warn"
            title={
              examples === entries.length
                ? "Every entry below is an example"
                : `${examples} of these entries are examples`
            }
          >
            No meeting described here took place, no proposal was made, and no
            answer was given. They show officers what an entry looks like before
            there are real ones. Entries are kept in a spreadsheet rather than in
            this site&rsquo;s code, and the moment that sheet has a single row
            these disappear.
          </Callout>
        </div>
      ) : null}

      <SgFeedBoard entries={entries} />

      {/* Legend after the board: reference, not an entry gate. */}
      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label text-faint">What each proposal stage means</h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {SG_PROPOSAL_STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col gap-1.5">
              <dt>
                <StatusPip label={stage.label} tone={stage.tone as StatusTone} />
              </dt>
              <dd className="text-sm leading-relaxed text-muted">
                {stage.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
