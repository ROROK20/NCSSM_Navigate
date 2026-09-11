import Link from "next/link";
import { getOpportunities, getResources } from "@/lib/content";
import {
  OPPORTUNITY_CATEGORY_BY_ID,
  RESOURCE_CATEGORY_BY_ID,
} from "@/content/taxonomy";
import { site } from "@/content/site";
import { dateParts } from "@/lib/format";
import {
  ArrowRight,
  ArrowUpRight,
  ButtonLink,
  CategoryTag,
  Chip,
  Eyebrow,
  LockIcon,
  type Tone,
} from "@/components/ui";
import { SeedNotice } from "@/components/seed-notice";

// The homepage surfaces merged content (featured rows, the resource count), so
// it has to read overrides per request like the directories do. Without this it
// prerenders at build time and an editor's change never reaches it.
export const dynamic = "force-dynamic";

/**
 * The four things students come here to do. Order matters: this is the
 * priority order SG wants, and it is mirrored in the header navigation.
 */
const ACTIONS: ReadonlyArray<{
  href: string;
  index: string;
  title: string;
  body: string;
  primary?: boolean;
}> = [
  {
    href: "/resources",
    index: "01",
    title: "Find a resource",
    body: "Tutoring, counseling, forms, dorm and dining info, IT help. Search once instead of guessing which site it lives on.",
    primary: true,
  },
  {
    href: "/opportunities",
    index: "02",
    title: "Explore opportunities",
    body: "Hackathons, competitions, volunteering, and events around Durham that are actually open to high schoolers.",
  },
  {
    href: "/report",
    index: "03",
    title: "Report an issue",
    body: "Tell Student Government what is not working. Submit anonymously if you would rather not attach your name.",
  },
  {
    href: "/updates",
    index: "04",
    title: "View SG updates",
    body: "See what SG is working on and where each item stands, without the private details.",
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
    title: "What it cannot answer goes to SG",
    body: "If nothing here covers it, report it. SG routes issues to whoever actually owns the decision, and posts the status publicly.",
  },
];

export default async function HomePage() {
  const [resources, opportunities] = await Promise.all([
    getResources(),
    getOpportunities(),
  ]);

  const featuredResources = resources.filter((r) => r.featured).slice(0, 6);

  // Featured entries first, then whatever is next, so the strip is always a
  // full row of three rather than a grid with a hole in it.
  const featuredOpportunities = [
    ...opportunities.filter((o) => o.featured),
    ...opportunities.filter((o) => !o.featured),
  ].slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
          <Eyebrow>{site.campus} · Student Government</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.025em] text-ink sm:text-6xl">
            {site.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {site.tagline}
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-faint">
            Find what you need without having to know which platform,
            department, or person to search for.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/resources">
              Find a resource
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/report" variant="secondary">
              Report an issue
            </ButtonLink>
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
            {ACTIONS.map((action, i) => (
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
                    "group flex h-full flex-col gap-2 border-b border-line p-6 transition-colors duration-150 sm:p-8",
                    action.primary
                      ? "bg-accent-soft hover:bg-[color:color-mix(in_oklch,var(--accent)_14%,transparent)]"
                      : "hover:bg-sunken",
                  ].join(" ")}
                >
                  <span className="label tnum text-faint">{action.index}</span>
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

      {/* ------------------------------------------------ featured resources */}
      <section aria-labelledby="featured-heading" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Most asked for</Eyebrow>
              <h2
                id="featured-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-ink"
              >
                Start here
              </h2>
            </div>
            <Link
              href="/resources"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent"
            >
              All {resources.length} resources
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="mt-8 border-t border-line">
            {featuredResources.map((resource) => {
              const category = RESOURCE_CATEGORY_BY_ID[resource.category];
              const external = resource.officialUrl.startsWith("http");
              const Row = external ? "a" : Link;
              return (
                <li key={resource.id} className="border-b border-line">
                  <Row
                    href={resource.officialUrl}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex flex-col gap-1.5 py-4 transition-colors hover:bg-sunken sm:flex-row sm:items-center sm:gap-6 sm:px-3"
                  >
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink group-hover:text-accent">
                          {resource.name}
                        </span>
                        {resource.loginRequired ? (
                          <Chip icon={<LockIcon />}>NCSSM login</Chip>
                        ) : null}
                        {external ? (
                          <ArrowUpRight className="text-faint" />
                        ) : null}
                      </span>
                      <span className="mt-1 block max-w-xl text-sm leading-relaxed text-muted">
                        {resource.description}
                      </span>
                    </span>
                    <CategoryTag
                      label={category.label}
                      tone={category.tone as Tone}
                      className="shrink-0"
                    />
                  </Row>
                </li>
              );
            })}
          </ul>
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
              gaps in the directory get fixed when someone says so. Tell SG and
              it goes on the list.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/report">
                Report an issue
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/sg" variant="secondary">
                What SG can and cannot do
              </ButtonLink>
            </div>
          </div>
          <div className="mt-10">
            <SeedNotice />
          </div>
        </div>
      </section>
    </>
  );
}
