import type { Metadata } from "next";
import { getOpportunities } from "@/lib/content";
import {
  OpportunityDirectory,
  type OpportunityView,
} from "@/components/opportunity-directory";
import { Callout, Eyebrow } from "@/components/ui";
import {
  dateParts,
  daysUntil,
  formatDate,
  relativeDayLabel,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Hackathons, competitions, volunteering, arts, and community events around Durham that NCSSM students can actually take part in.",
};

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();

  // Everything clock-dependent is resolved here, once, on the server. The
  // client component receives finished strings and never recomputes them.
  const now = new Date();
  const items: OpportunityView[] = opportunities.map((item) => {
    const days = item.date ? daysUntil(item.date, now) : null;
    const parts = dateParts(item.date);
    return {
      ...item,
      isPast: days !== null && days < 0,
      whenLabel: formatDate(item.date),
      countdownLabel: days !== null && days >= 0 ? relativeDayLabel(days) : null,
      monthLabel: parts?.month ?? null,
      dayLabel: parts?.day ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 pb-2 sm:pt-14">
        <Eyebrow>Durham & beyond</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Opportunities
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Hackathons, competitions, volunteering, and events around Durham.
          Collected by students, so treat it as a starting point rather than a
          complete list.
        </p>
      </header>

      {/*
        One notice, not two. These listings carry the same caveat for the same
        reason, and two stacked amber boxes just read as noise to scroll past.
      */}
      <div className="mb-6">
        <Callout tone="warn" title="Check before you register or go">
          Student Government does not run, vet, or endorse these events, and
          this is starter data nobody has confirmed with an organiser yet. Check
          the date, cost, age requirements, and transport yourself before you
          commit. Anything involving travel, money, or leaving campus also needs
          the usual school and parent permissions.
        </Callout>
      </div>

      <OpportunityDirectory items={items} />
    </div>
  );
}
