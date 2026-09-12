import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report-form";
import { isDemo } from "@/content/stage";
import { Eyebrow } from "@/components/ui";
import { sgAbout, site } from "@/content/site";
import { stage } from "@/content/stage";

export const metadata: Metadata = {
  title: "Report an issue",
  description:
    "How issue reporting works in NCSSM Navigate: anonymous by choice, never published, and routed to whoever owns the decision.",
  // Nothing on this page should be indexed as an answer to a search query.
  robots: { index: true, follow: true },
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>Student Government</Eyebrow>
        <h1 className="display mt-3 text-ink">
          Report an issue
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Something on campus not working the way it should? Tell SG. You do not
          need an account, and you can leave your name out of it entirely.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="max-w-2xl space-y-6">
          {/*
            Said before the form rather than only on the confirmation screen.
            Someone arriving with a real problem should know where they stand
            before they spend five minutes writing it out.
          */}
          {isDemo ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--accent)]/25 bg-accent-soft px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                This form is a demonstration
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                It validates, confirms, and appears on the status board exactly
                as the real thing does. Nothing is sent, stored, or seen by
                anyone. If you have an issue that needs handling today,{" "}
                {stage.currentRoute.detail}
              </p>
            </div>
          ) : null}
          <ReportForm />
        </div>

        {/*
          Expectation-setting sits beside the form rather than above it, so it
          is readable while filling it in without pushing the form off screen.
        */}
        {/*
          A reference rail, not a second column of body copy. Four sections at
          the same size and colour read as one undifferentiated wall; hairlines
          and a smaller size let someone find the one line they need while
          filling in the form beside it.
        */}
        <aside className="divide-y divide-line text-[13px] lg:sticky lg:top-24 lg:self-start">
          <section className="pb-6">
            <h2 className="label text-faint">What happens next</h2>
            <ol className="mt-3 space-y-2.5 leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="tnum shrink-0 font-medium text-accent">1</span>
                <span>An SG officer reads it and files it under a category.</span>
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 font-medium text-accent">2</span>
                <span>
                  SG works out who owns the decision, which is often a school
                  office rather than SG.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="tnum shrink-0 font-medium text-accent">3</span>
                <span>
                  A generalised entry appears on the{" "}
                  <Link
                    href="/updates"
                    className="text-ink underline underline-offset-2"
                  >
                    status board
                  </Link>{" "}
                  with no identifying details.
                </span>
              </li>
            </ol>
          </section>

          <section className="py-6">
            <h2 className="label text-faint">Your privacy</h2>
            <ul className="mt-3 space-y-2 leading-relaxed text-muted">
              <li>Submissions are never shown publicly, in any form.</li>
              <li>
                Anonymous submissions store no contact details at all, so there
                is nothing to leak later.
              </li>
              <li>
                If you give an email, only SG officers see it. It is never
                published and never passed on without a reason to.
              </li>
              <li>
                SG may forward the substance of an issue to the school office
                that handles it.
              </li>
            </ul>
          </section>

          <section className="py-6">
            <h2 className="label text-faint">What SG cannot do</h2>
            <ul className="mt-3 space-y-2 leading-relaxed text-muted">
              {sgAbout.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </section>

          <section className="pt-6">
            <h2 className="label text-faint">Rather email?</h2>
            <p className="mt-3 leading-relaxed text-muted">
              <a
                href={`mailto:${site.contact.email}`}
                className="text-ink underline underline-offset-2"
              >
                {site.contact.email}
              </a>
              <span className="mt-1 block text-faint">{site.contact.note}</span>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
