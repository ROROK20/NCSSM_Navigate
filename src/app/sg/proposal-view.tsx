import Link from "next/link";
import { stage } from "@/content/stage";
import { site } from "@/content/site";
import {
  ArrowRight,
  ButtonLink,
  Callout,
  Chip,
  Eyebrow,
} from "@/components/ui";

/**
 * The proposal page: what Navigate is, what it already does, and what
 * adopting it would actually require.
 *
 * Written to be checkable. Every claim here is either something a reader can
 * click and verify on this site, or a named dependency on someone else. A
 * campaign page that overclaims is worse than none, because the whole argument
 * is that this one was built rather than promised.
 */
export function SgProposalView() {
  const who = stage.candidate.name;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>The proposal</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Most of what students need already exists. Finding it is the problem.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          Navigate is a working site, not a plan for one. Every page on this
          domain does what it says: search the directory, submit an issue, watch
          it land on the status board. The only thing missing is an office
          behind it — until Student Government adopts it, submissions stay in
          your own browser instead of reaching anyone.
        </p>
      </header>

      {/* ----------------------------------------------------- the problem */}
      <section className="mt-12" aria-labelledby="problem-heading">
        <h2
          id="problem-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          The problem
        </h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
          {[
            {
              title: "You have to know where to look",
              body: "Answers are split across Canvas, Blackbaud, email, posted flyers, and whoever happens to know. Finding something means guessing which system owns it.",
            },
            {
              title: "You have to know the right word",
              body: "Searching works only if you already use the school's vocabulary. Nobody types “academic advising” when what they mean is “I want to drop a class”.",
            },
            {
              title: "Raising an issue goes nowhere visible",
              body: "You tell someone, and then nothing observable happens. There is no way to see whether it was heard, dropped, or is genuinely being worked on.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-paper p-5 sm:p-6">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- what exists now */}
      <section className="mt-14" aria-labelledby="built-heading">
        <h2
          id="built-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          What is already built
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Click anything in this list and try it. Nothing here is a mockup or a
          screenshot — it is the finished thing, running.
        </p>

        <ul className="mt-6 border-t border-line">
          {[
            {
              href: "/resources",
              title: "A searchable resource directory",
              body: "One list covering academic support, counseling, residential life, dining, transport, technology, and forms. Search by what you are trying to do rather than the department that owns it.",
              state: "live" as const,
            },
            {
              href: "/resources",
              title: "Search that speaks like a student",
              body: "Every entry carries the words people actually type. Searching “stressed” finds Counseling; “broken dryer” finds the maintenance request. No AI, so it is instant and cannot invent a link.",
              state: "live" as const,
            },
            {
              href: "/opportunities",
              title: "An opportunities board for Durham",
              body: "Hackathons, competitions, volunteering, and events, with dates, cost, and eligibility on every entry, and an explicit warning to verify before registering.",
              state: "live" as const,
            },
            {
              href: "/report",
              title: "Issue reporting, anonymous by choice",
              body: "Validated, spam-resistant, and private by construction: an anonymous report stores no contact details at all, so there is nothing to leak later.",
              state: "demo" as const,
            },
            {
              href: "/updates",
              title: "A public status board",
              body: "Every issue gets a stage students can see, with no names, quotes, or room numbers. Being listed is never a promise it will be solved.",
              state: "demo" as const,
            },
            {
              href: "/admin",
              title: "An editor SG can run without code",
              body: "Officers update links, mark entries verified or outdated, and post status updates from a password-protected page. Handing this to next year's officers is a password, not a tutorial.",
              state: "live" as const,
            },
          ].map((item) => (
            <li key={item.title} className="border-b border-line">
              <Link
                href={item.href}
                className="group flex flex-col gap-1.5 py-4 transition-colors hover:bg-sunken sm:-mx-3 sm:px-3"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink group-hover:text-accent">
                    {item.title}
                  </span>
                  {item.state === "demo" ? (
                    <Chip tone="warn">Demo only</Chip>
                  ) : (
                    <Chip>Live now</Chip>
                  )}
                  <ArrowRight className="text-faint transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="max-w-2xl text-sm leading-relaxed text-muted">
                  {item.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------- deliberate omissions */}
      <section className="mt-14" aria-labelledby="limits-heading">
        <h2
          id="limits-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          What it deliberately does not do
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          These are choices, not gaps. Each one is a line worth keeping even
          when it would be easy to cross.
        </p>

        <dl className="mt-6 max-w-3xl border-t border-line">
          {[
            [
              "Never asks for your school password",
              "Navigate links out to NCSSM systems and stops there. It never proxies, mirrors, or stores anything from behind a school login, and it has no password of its own to forget.",
            ],
            [
              "Never shows a student's report",
              "Submissions are private without exception. Public entries are written from scratch by an officer, generalised enough to cover several reports at once.",
            ],
            [
              "Never lets a demo pass for the real thing",
              "Everything is explorable, and the moment it would matter — the confirmation after you submit — it says plainly that nothing was sent. A demo that fools someone with a real problem is not a good demo.",
            ],
            [
              "Never promises SG can fix everything",
              "Most issues belong to a school office. The honest job is routing them to whoever owns the decision and showing students where the thing actually stands.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="border-b border-line py-4">
              <dt className="font-medium text-ink">{title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------ what adoption needs */}
      <section className="mt-14" aria-labelledby="adopt-heading">
        <h2
          id="adopt-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          What switching on the rest would take
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          None of this is a technical problem. All four are decisions that need
          an office and an advisor behind them.
        </p>

        <ol className="mt-6 max-w-3xl space-y-5 border-t border-line pt-6">
          {[
            {
              title: "A Student Government account that outlives its officers",
              body: "Issue reports have to land somewhere SG owns and can hand on, not in a personal inbox that graduates.",
            },
            {
              title: "A staff advisor who knows the obligations",
              body: "Some reports will touch safety, harassment, or a student in crisis. Those need an adult who knows what the school is required to do, agreed before the first one arrives rather than after.",
            },
            {
              title: "Officers who verify the directory",
              body: "Every link needs a person to open it and confirm it is right. The site tracks who checked what and when, and flags entries nobody has confirmed.",
            },
            {
              title: "A rhythm for deleting old reports",
              body: "Reports kept forever are a liability with no upside. Clearing actioned ones on a schedule is part of running this properly.",
            },
          ].map((item, i) => (
            <li key={item.title} className="flex gap-4">
              <span className="tnum shrink-0 text-sm font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-medium text-ink">{item.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {item.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ close */}
      <section className="mt-14 border-t border-line pt-10">
        <Callout tone="info" title="Who made this">
          {who ? (
            <>
              Built by {who}, running for {stage.candidate.office}. It is a
              working proposal rather than a campaign promise, and it stays up
              either way — the directory is useful to students whatever the
              result.
            </>
          ) : (
            <>
              Built by a student as a proposal for {stage.candidate.office}. It
              is a working site rather than a campaign promise, and it stays up
              either way — the directory is useful to students whatever the
              result.
            </>
          )}
        </Callout>

        <h2 className="mt-10 text-xl font-semibold tracking-tight text-ink">
          Found something wrong?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          A bad link or a missing resource is the most useful thing you can
          point out right now. Email {site.contact.email}.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/resources">
            Browse the directory
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/opportunities" variant="secondary">
            See what is on in Durham
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
