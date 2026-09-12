import type { Metadata } from "next";
import Link from "next/link";
import { sgAbout, sgDocuments, sgSenate, site } from "@/content/site";
import {
  ArrowRight,
  ArrowUpRight,
  ButtonLink,
  Callout,
  Chip,
  Eyebrow,
  LockIcon,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import { isDemo } from "@/content/stage";
import { SgProposalView } from "./proposal-view";

export const metadata: Metadata = isDemo
  ? {
      title: "The proposal",
      description:
        "NCSSM Navigate: a working student-built site for finding campus resources and Durham opportunities, and the case for Student Government adopting the rest.",
    }
  : {
      title: "About Student Government",
      description:
        "What NCSSM-Durham Student Government does, how to contact it, when Senate meets, and where to find SG documents, minutes, and voting records.",
    };

export default function SgPage() {
  // While Navigate is a proposal this page makes the case for it rather than
  // presenting officers and documents the author does not hold.
  if (isDemo) return <SgProposalView />;

  const publicDocs = sgDocuments.filter((doc) => doc.access === "public");
  const internalDocs = sgDocuments.filter((doc) => doc.access === "internal");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-14">
        <Eyebrow>{site.campus}</Eyebrow>
        <h1 className="display mt-3 text-ink">
          Student Government
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          SG represents students to the people who make decisions about student
          life. This page covers what that means in practice, including the
          parts SG has no power over.
        </p>
      </header>

      {/* -------------------------------------------------------- what we do */}
      <section className="mt-12" aria-labelledby="what-heading">
        <h2
          id="what-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          What Student Government does
        </h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
          {sgAbout.whatWeDo.map((item) => (
            <div key={item.title} className="bg-paper p-5 sm:p-6">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- limits */}
      <section className="mt-12" aria-labelledby="limits-heading">
        <h2
          id="limits-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          What it cannot do
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Being straight about this saves students time, and stops SG from
          quietly sitting on something that belongs somewhere else.
        </p>
        <ul className="mt-5 max-w-3xl border-t border-line">
          {sgAbout.limits.map((limit) => (
            <li
              key={limit}
              className="border-b border-line py-3.5 text-sm leading-relaxed text-muted"
            >
              {limit}
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- contact/meeting */}
      <section
        className="mt-12 grid gap-10 md:grid-cols-2"
        aria-labelledby="contact-heading"
      >
        <div>
          <h2
            id="contact-heading"
            className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
          >
            Getting in touch
          </h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="label text-faint">Email</dt>
              <dd className="mt-1.5">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-ink underline decoration-line-strong underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent"
                >
                  {site.contact.email}
                </a>
                <span className="mt-1 block text-muted">
                  {site.contact.note}
                </span>
              </dd>
            </div>
            <div>
              <dt className="label text-faint">Report something</dt>
              <dd className="mt-1.5 text-muted">
                Use the{" "}
                <Link
                  href="/report"
                  className="text-ink underline underline-offset-2"
                >
                  issue form
                </Link>{" "}
                if you want it logged and tracked, or if you would rather stay
                anonymous.
              </dd>
            </div>
            <div>
              <dt className="label text-faint">Speak at Senate</dt>
              <dd className="mt-1.5 text-muted">{sgAbout.meetings.note}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Meetings
          </h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div>
              <dt className="label text-faint">Senate</dt>
              <dd className="mt-1.5 text-muted">{sgAbout.meetings.senate}</dd>
            </div>
            <div>
              <dt className="label text-faint">Officers</dt>
              <dd className="mt-1.5 text-muted">{sgAbout.meetings.cabinet}</dd>
            </div>
            <div>
              <dt className="label text-faint">Where and when</dt>
              <dd className="mt-1.5 text-muted">{sgAbout.meetings.location}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- documents */}
      <section className="mt-14" aria-labelledby="docs-heading">
        <h2
          id="docs-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          Documents & records
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Public documents are linked below. Some open on school systems and ask
          for an NCSSM login; Navigate links to them and nothing more.
        </p>

        <ul className="mt-6 border-t border-line">
          {publicDocs.map((doc) => {
            const updated = formatDate(doc.updated);
            return (
              <li key={doc.id} className="border-b border-line">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 py-4 transition-colors hover:bg-sunken sm:-mx-3 sm:px-3"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink group-hover:text-accent">
                      {doc.title}
                    </span>
                    <ArrowUpRight className="text-faint" />
                    {doc.loginRequired ? (
                      <Chip icon={<LockIcon />}>NCSSM login required</Chip>
                    ) : null}
                  </span>
                  {doc.description ? (
                    <span className="max-w-2xl text-sm leading-relaxed text-muted">
                      {doc.description}
                    </span>
                  ) : null}
                  {updated ? (
                    <span className="tnum text-xs text-faint">
                      Updated {updated}
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Internal items are named but never linked, so students can see what
            exists without the contents being handed out. */}
        {internalDocs.length > 0 ? (
          <div className="mt-8">
            <h3 className="label text-faint">Internal, not published</h3>
            <ul className="mt-3 max-w-3xl border-t border-line">
              {internalDocs.map((doc) => (
                <li key={doc.id} className="border-b border-line py-3.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted">
                      {doc.title}
                    </span>
                    <Chip>Not public</Chip>
                  </span>
                  {doc.description ? (
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-faint">
                      {doc.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* ----------------------------------------------------------- senate */}
      <section className="mt-14" aria-labelledby="senate-heading">
        <h2
          id="senate-heading"
          className="text-xl font-semibold tracking-tight text-ink sm:text-2xl"
        >
          Senate
        </h2>
        <div className="mt-4 max-w-3xl">
          <Callout tone="warn">{sgSenate.note}</Callout>
        </div>
        <dl className="mt-6 max-w-3xl border-t border-line">
          {sgSenate.seats.map((seat) => (
            <div
              key={seat.role}
              className="flex flex-wrap justify-between gap-2 border-b border-line py-3.5 text-sm"
            >
              <dt className="font-medium text-ink">{seat.role}</dt>
              <dd className="text-muted">{seat.holder}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Want SG to look at something?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          The issue form is the fastest route. It gets logged, categorised, and
          tracked on the public board.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/report">
            Report an issue
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/updates" variant="secondary">
            See the status board
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
