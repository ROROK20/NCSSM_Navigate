import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/report-form";
import { Eyebrow } from "@/components/ui";
import { sgAbout, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Report an issue",
  description:
    "Tell NCSSM-Durham Student Government about something that is not working. Submit anonymously if you prefer. Submissions are never published.",
  // Nothing on this page should be indexed as an answer to a search query.
  robots: { index: true, follow: true },
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>Student Government</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Report an issue
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Something on campus not working the way it should? Tell SG. You do not
          need an account, and you can leave your name out of it entirely.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="max-w-2xl">
          <ReportForm />
        </div>

        {/*
          Expectation-setting sits beside the form rather than above it, so it
          is readable while filling it in without pushing the form off screen.
        */}
        <aside className="space-y-8 text-sm lg:sticky lg:top-24 lg:self-start">
          <section>
            <h2 className="label text-faint">What happens next</h2>
            <ol className="mt-3 space-y-3 text-muted">
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

          <section>
            <h2 className="label text-faint">Your privacy</h2>
            <ul className="mt-3 space-y-2.5 text-muted">
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

          <section>
            <h2 className="label text-faint">What SG cannot do</h2>
            <ul className="mt-3 space-y-2.5 text-muted">
              {sgAbout.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="label text-faint">Rather email?</h2>
            <p className="mt-3 text-muted">
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
