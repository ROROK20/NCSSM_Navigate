import Link from "next/link";
import { ISSUE_CATEGORIES } from "@/content/taxonomy";
import { sgAbout } from "@/content/site";
import { stage } from "@/content/stage";
import { ArrowRight, ButtonLink, Callout, Eyebrow } from "@/components/ui";

/**
 * The reporting page while Navigate is still a proposal.
 *
 * It shows exactly what the finished flow does without collecting anything.
 * That is the honest position for a candidate's site: a student who arrives
 * here with a real problem needs a route that works today, not a form that
 * files their report into a queue nobody holds the office to act on.
 */
export function ReportProposalView() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>Built, not yet switched on</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Reporting an issue
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          This part of Navigate is finished and tested. It stays switched off
          until Student Government actually adopts it, because a report needs
          someone with the standing to act on it.
        </p>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="max-w-2xl space-y-8">
          <Callout tone="warn" title="If you need something now">
            Navigate is not the route today. {stage.currentRoute.detail} In an
            emergency call 911. For mental-health support any time, call or
            text 988. For anything involving safety, harassment, or a student
            in crisis, talk to a counselor, an RLI, or Campus Safety directly —
            those routes work right now and a website should never sit between
            you and them.
          </Callout>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              What it does once it is on
            </h2>
            <ol className="mt-5 space-y-4 border-t border-line pt-5">
              {[
                {
                  title: "You describe the problem",
                  body: "A title, what is happening, and a category. Optionally where on campus. Nothing else is required.",
                },
                {
                  title: "You choose whether to attach your name",
                  body: "Anonymous submissions store no contact details at all — not hidden, not stored. There is nothing to leak later.",
                },
                {
                  title: "An officer reads it and routes it",
                  body: "Most issues belong to a school office rather than SG. The job is working out which one and bringing a consolidated case.",
                },
                {
                  title: "A generalised entry appears publicly",
                  body: "No names, no quotes, no room numbers. One entry often covers several reports about the same thing.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="tnum shrink-0 text-sm font-medium text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-medium text-ink">
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Categories it accepts
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ISSUE_CATEGORIES.map((category) => (
                <li
                  key={category.id}
                  className="rounded-full border border-line px-3 py-1.5 text-[13px] text-muted"
                >
                  {category.label}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Why it is off rather than collecting quietly
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              A form that accepts reports nobody is empowered to handle is worse
              than no form. Students would reasonably assume someone was
              working on their problem. The code refuses submissions at the
              server, not just by hiding the form, so it cannot be switched on
              by accident.
            </p>
          </section>
        </div>

        <aside className="space-y-8 text-sm lg:sticky lg:top-24 lg:self-start">
          <section>
            <h2 className="label text-faint">What SG cannot do</h2>
            <ul className="mt-3 space-y-2.5 text-muted">
              {sgAbout.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="label text-faint">What works today</h2>
            <p className="mt-3 text-muted">
              The resource directory and the opportunities board are live and
              need nobody&rsquo;s permission to be useful.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 font-medium text-accent"
              >
                Find a resource
                <ArrowRight />
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1.5 font-medium text-accent"
              >
                Explore opportunities
                <ArrowRight />
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          See the rest of what is built
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          The public status board is finished too, running on example entries
          until there are real ones.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/updates" variant="secondary">
            Preview the status board
          </ButtonLink>
          <ButtonLink href="/sg">
            Read the proposal
            <ArrowRight />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
