import Link from "next/link";
import { getOpportunities, getResources } from "@/lib/content";
import {
  OPPORTUNITY_CATEGORY_BY_ID,
  RESOURCE_CATEGORY_BY_ID,
} from "@/content/taxonomy";
import { homepagePicks, moreDirectories, site } from "@/content/site";
import { isDemo } from "@/content/stage";
import { dateParts } from "@/lib/format";
import {
  ArrowRight,
  toneVar,
  ArrowUpRight,
  ButtonLink,
  CategoryTag,
  Eyebrow,
  type Tone,
} from "@/components/ui";
import { SeedNotice } from "@/components/seed-notice";
import { HeroSearch } from "@/components/hero-search";

// The homepage surfaces merged content (featured rows, the resource count), so
// it has to read overrides per request like the directories do. Without this it
// prerenders at build time and an editor's change never reaches it.
export const dynamic = "force-dynamic";

/**
 * The four things students come here to do. Order matters: this is the
 * priority order SG wants, and it is mirrored in the header navigation.
 */
interface Action {
  href: string;
  index: string;
  title: string;
  body: string;
  primary?: boolean;
  /** False while the feature is built but not yet switched on. */
  live: boolean;
}

const ACTIONS: ReadonlyArray<Action> = [
  {
    href: "/resources",
    index: "01",
    title: "Find a resource",
    body: "Tutoring, counseling, forms, dorm and dining info, IT help. Search once instead of guessing which site it lives on.",
    primary: true,
    live: true,
  },
  {
    href: "/opportunities",
    index: "02",
    title: "Explore opportunities",
    body: "Hackathons, competitions, volunteering, and events around Durham that are actually open to high schoolers.",
    live: true,
  },
  {
    href: "/report",
    index: "03",
    title: "Report an issue",
    body: "Tell Student Government what is not working. Submit anonymously if you would rather not attach your name.",
    live: true,
  },
  {
    href: "/updates",
    index: "04",
    title: "View SG updates",
    body: "See what SG is working on and where each item stands, without the private details.",
    live: true,
  },
] as const;

const STEPS = [
  {
    title: "You describe the thing, not the system",
    body: "Search for “broken dryer” or “transcript” instead of remembering whether it lives in Blackbaud, Canvas, or an email from August.",
  },
  {
    title: "Navigate sends you to the official source",
    body: "Every link goes straight to the school's own system. Navigate never stores your coursework, your records, or your password.",
  },
  {
    title: isDemo
      ? "What it cannot answer is the next piece"
      : "What it cannot answer goes to SG",
    body: isDemo
      ? "Issue reporting and a public status board are built and tested. They switch on when Student Government adopts them, because a report needs someone with the standing to act on it."
      : "If nothing here covers it, report it. SG routes issues to whoever actually owns the decision, and posts the status publicly.",
  },
];

export default async function HomePage() {
  const [resources, opportunities] = await Promise.all([
    getResources(),
    getOpportunities(),
  ]);

  // Ordered by the curated list, not by position in the data file.
  const byId = new Map(resources.map((r) => [r.id, r]));
  const featuredResources = homepagePicks
    .map((id) => byId.get(id))
    .filter((r) => r !== undefined);

  // Featured entries first, then whatever is next, so the strip is always a
  // full row of three rather than a grid with a hole in it.
  const featuredOpportunities = [
    ...opportunities.filter((o) => o.featured),
    ...opportunities.filter((o) => !o.featured),
  ].slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      {/*
        The board.

        One committed surface against an otherwise restrained page. Mono
        labels, indicator dots and right-aligned tabular meta, because the
        thing this most resembles is a departure board: a list of destinations,
        scanned, not read. The contrast between this panel and the light page
        below is the whole visual argument.
      */}
      <section className="bg-board text-board-ink">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start lg:gap-20">
          <div>
            <p className="label text-board-accent">
              {site.campus} · Student Government
            </p>
            <h1 className="mt-5 text-[clamp(2.75rem,7vw,4.5rem)] leading-[0.92] font-bold tracking-[-0.04em] text-board-ink">
              {site.name}
            </h1>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-snug text-board-muted">
              {site.tagline}
            </p>
            <HeroSearch total={resources.length} />
          </div>

          <div className="lg:pt-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-board-line pb-2.5">
              <span className="label text-board-faint">Most looked up</span>
              <Link
                href="/resources"
                className="group inline-flex items-center gap-1 text-[13px] font-medium text-board-accent"
              >
                All {resources.length}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul>
              {featuredResources.map((resource) => {
                const category = RESOURCE_CATEGORY_BY_ID[resource.category];
                const external = resource.officialUrl.startsWith("http");
                return (
                  <li key={resource.id} className="border-b border-board-line">
                    <a
                      href={resource.officialUrl}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-white/[0.04] sm:-mx-3 sm:px-3"
                    >
                      <span
                        aria-hidden="true"
                        className="size-[7px] shrink-0 rounded-full"
                        style={{ background: toneVar(category.tone as Tone) }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[15px] text-board-ink transition-colors group-hover:text-board-accent">
                        {resource.name}
                      </span>
                      {resource.loginRequired ? (
                        <span className="shrink-0 text-[10px] tracking-[0.08em] text-board-faint uppercase">
                          Login
                        </span>
                      ) : null}
                      {external ? (
                        <ArrowUpRight className="shrink-0 text-board-faint transition-colors group-hover:text-board-accent" />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- primary actions */}
      <section aria-labelledby="actions-heading" className="border-b border-line">
        <h2 id="actions-heading" className="sr-only">
          What you can do here
        </h2>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ul className="grid border-x border-line sm:grid-cols-2">
            {ACTIONS.filter((action) => action.live).map((action, i) => (
              <li
                key={action.href}
                className={
                  // Hairlines between cells rather than gaps between cards:
                  // the block reads as one board, not four floating tiles.
                  i % 2 === 0 ? "sm:border-r border-line" : ""
                }
              >
                <Link
                  href={action.href}
                  className={[
                    "group flex h-full flex-col gap-1.5 border-b border-line px-6 py-7 transition-colors duration-150 sm:px-8",
                    action.primary
                      ? "bg-accent-soft hover:bg-[color:color-mix(in_oklch,var(--accent)_14%,transparent)]"
                      : "hover:bg-sunken",
                  ].join(" ")}
                >
                  <span className="label tnum text-muted">{action.index}</span>
                  <span className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                    {action.title}
                    <ArrowRight className="text-accent transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                  <span className="max-w-sm text-sm leading-relaxed text-muted">
                    {action.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------- secondary directories */}
      {/*
        Quieter than the block above on purpose. These are real destinations,
        but a student arriving with a question reaches for one of the four
        first, and a second identical grid would flatten that difference.
      */}
      {moreDirectories.length > 0 ? (
        <section aria-labelledby="more-heading" className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
            <Eyebrow>Also here</Eyebrow>
            <h2
              id="more-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-ink"
            >
              More directories
            </h2>
            <ul className="mt-6 border-t border-line">
              {moreDirectories.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-1 py-3.5 transition-colors duration-150 hover:bg-sunken"
                  >
                    <span className="font-medium text-ink transition-colors group-hover:text-accent">
                      {item.label}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-relaxed text-muted">
                      {item.blurb}
                    </span>
                    <ArrowRight className="shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------- how it works */}
      <section aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <Eyebrow>How Navigate works</Eyebrow>
          <h2
            id="how-heading"
            className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Three steps, no accounts, no new password.
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-paper p-6">
                <span className="label tnum text-accent">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------- featured opportunities */}
      {featuredOpportunities.length > 0 ? (
        <section
          aria-labelledby="opps-heading"
          className="border-t border-line bg-sunken"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Around Durham</Eyebrow>
                <h2
                  id="opps-heading"
                  className="mt-3 text-2xl font-semibold tracking-tight text-ink"
                >
                  Worth a look
                </h2>
              </div>
              <Link
                href="/opportunities"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                All opportunities
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
              {featuredOpportunities.map((item) => {
                const category = OPPORTUNITY_CATEGORY_BY_ID[item.category];
                const when = dateParts(item.date);
                return (
                  <li key={item.id} className="bg-paper p-5">
                    <div className="flex items-start justify-between gap-3">
                      <CategoryTag
                        label={category.label}
                        tone={category.tone as Tone}
                      />
                      {when ? (
                        <span className="tnum shrink-0 text-right text-xs leading-tight text-faint">
                          <span className="label block text-accent">
                            {when.month}
                          </span>
                          <span className="text-base font-semibold text-ink">
                            {when.day}
                          </span>
                        </span>
                      ) : (
                        <span className="label shrink-0 text-faint">Ongoing</span>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                    <p className="mt-3 text-xs text-faint">
                      {item.location} · {item.cost}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- final CTA */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Something here wrong, missing, or out of date?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Navigate is maintained by students. Broken links, stale hours, and
              gaps in the directory get fixed when someone says so.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isDemo ? (
                <>
                  <ButtonLink href="/sg">
                    Read the proposal
                    <ArrowRight />
                  </ButtonLink>
                  <ButtonLink href="/resources" variant="secondary">
                    Browse the directory
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/report">
                    Report an issue
                    <ArrowRight />
                  </ButtonLink>
                  <ButtonLink href="/sg" variant="secondary">
                    What SG can and cannot do
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
          <div className="mt-10">
            <SeedNotice subject="resources" />
          </div>
        </div>
      </section>
    </>
  );
}
