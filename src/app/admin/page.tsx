import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, isEditor } from "@/lib/admin-auth";
import { probeStorage, storageMode } from "@/lib/store";
import {
  getOverrides,
  getSeedOpportunities,
  getSeedResources,
  getUpdates,
} from "@/lib/content";
import { listSubmissions } from "@/lib/submissions";
import {
  ISSUE_CATEGORY_BY_ID,
  ISSUE_STATUS_BY_ID,
  RESOURCE_CATEGORY_BY_ID,
} from "@/content/taxonomy";
import { SignInForm } from "@/components/admin/sign-in-form";
import { UpdateEditor } from "@/components/admin/update-editor";
import {
  Button,
  Callout,
  Chip,
  Eyebrow,
  StatusPip,
  type StatusTone,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import {
  removeSubmission,
  removeUpdate,
  setOpportunityFlags,
  setResourceHidden,
  setResourceUrl,
  setResourceVerification,
  signOut,
  triageSubmission,
} from "./actions";

export const metadata: Metadata = {
  title: "Editor",
  // Keep the admin surface out of search results entirely.
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const TABS = [
  { id: "submissions", label: "Submissions" },
  { id: "resources", label: "Resources" },
  { id: "opportunities", label: "Opportunities" },
  { id: "updates", label: "Public updates" },
  { id: "export", label: "Export" },
] as const;

export default async function AdminPage(props: PageProps<"/admin">) {
  const params = await props.searchParams;
  const tab = String(params.tab ?? "submissions");

  /* ------------------------------------------------ not configured yet */
  if (!adminConfigured()) {
    return (
      <Shell>
        <Callout tone="warn" title="Editor access is switched off">
          Set <code className="text-ink">ADMIN_PASSWORD</code> in the
          environment to at least 12 characters, then restart the app. There is
          no default password, so nobody can sign in until you choose one.
        </Callout>
      </Shell>
    );
  }

  /* ----------------------------------------------------------- sign in */
  if (!(await isEditor())) {
    return (
      <Shell>
        <SignInForm />
      </Shell>
    );
  }

  /* --------------------------------------------------------- dashboard */
  await probeStorage();
  const storage = storageMode();

  const [submissions, updates, overrides] = await Promise.all([
    listSubmissions(),
    getUpdates(),
    getOverrides(),
  ]);
  const resources = getSeedResources();
  const opportunities = getSeedOpportunities();

  const newCount = submissions.filter((s) => s.triage === "new").length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-10 sm:pt-14">
        <div>
          <Eyebrow>Student Government</Eyebrow>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Editor
          </h1>
        </div>
        <form action={signOut}>
          <Button variant="secondary" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      {storage.mode === "memory" ? (
        <div className="mt-6">
          <Callout tone="danger" title="Changes will not survive a restart">
            This server cannot write to disk, so edits and submissions are held
            in memory for this instance only and are lost on the next deploy or
            restart. Point <code className="text-ink">NAVIGATE_DATA_DIR</code> at
            a writable volume, or deploy somewhere with a persistent disk. Use
            the Export tab before you leave this page.
          </Callout>
        </div>
      ) : null}

      <nav aria-label="Editor sections" className="mt-8 border-b border-line">
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={`/admin?tab=${item.id}`}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "inline-block border-b-2 border-accent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-ink"
                      : "inline-block border-b-2 border-transparent px-3 py-2.5 text-sm whitespace-nowrap text-muted transition-colors hover:text-ink"
                  }
                >
                  {item.label}
                  {item.id === "submissions" && newCount > 0 ? (
                    <span className="tnum ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[11px] text-accent-contrast">
                      {newCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8">
        {/* ------------------------------------------------- submissions */}
        {tab === "submissions" ? (
          <section aria-label="Submissions">
            <Callout tone="warn" title="Private, without exception">
              Nothing on this tab is public and none of it may be pasted into an
              update. Write public entries from scratch on the Public updates
              tab. Delete a submission once it has been actioned; keeping it
              indefinitely is a privacy risk with no upside.
            </Callout>

            {submissions.length === 0 ? (
              <p className="mt-8 border-y border-line py-12 text-center text-sm text-muted">
                No submissions yet.
              </p>
            ) : (
              <ul className="mt-6 border-t border-line">
                {submissions.map((submission) => (
                  <li key={submission.id} className="border-b border-line py-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Chip
                        tone={submission.triage === "new" ? "warn" : "neutral"}
                      >
                        {submission.triage}
                      </Chip>
                      <span className="label text-faint">
                        {ISSUE_CATEGORY_BY_ID[submission.category]?.label ??
                          submission.category}
                      </span>
                      {submission.anonymous ? (
                        <Chip>Anonymous</Chip>
                      ) : (
                        <Chip>Contact on file</Chip>
                      )}
                      <span className="tnum ml-auto text-faint">
                        {formatDate(submission.createdAt.slice(0, 10))}
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-semibold text-ink">
                      {submission.title}
                    </h3>
                    <p className="mt-1.5 max-w-3xl text-sm leading-relaxed whitespace-pre-line text-muted">
                      {submission.description}
                    </p>

                    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-faint">
                      {submission.location ? (
                        <div className="flex gap-1.5">
                          <dt className="label">Where</dt>
                          <dd>{submission.location}</dd>
                        </div>
                      ) : null}
                      {submission.contact ? (
                        <div className="flex gap-1.5">
                          <dt className="label">Contact</dt>
                          <dd className="text-muted">{submission.contact}</dd>
                        </div>
                      ) : null}
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["reviewed", "published", "closed"] as const).map(
                        (state) => (
                          <form action={triageSubmission} key={state}>
                            <input
                              type="hidden"
                              name="id"
                              value={submission.id}
                            />
                            <input type="hidden" name="triage" value={state} />
                            <Button
                              variant="secondary"
                              type="submit"
                              className="px-3 py-1.5 text-xs"
                            >
                              Mark {state}
                            </Button>
                          </form>
                        ),
                      )}
                      <form action={removeSubmission}>
                        <input type="hidden" name="id" value={submission.id} />
                        <Button
                          variant="ghost"
                          type="submit"
                          className="px-3 py-1.5 text-xs text-[color:var(--danger)]"
                        >
                          Delete permanently
                        </Button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {/* ---------------------------------------------------- resources */}
        {tab === "resources" ? (
          <section aria-label="Resources">
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Open each link, then mark it. Verifying stamps today&rsquo;s date.
              Marking a link outdated shows a warning next to it on the public
              directory rather than removing it.
            </p>

            <ul className="mt-6 border-t border-line">
              {resources.map((resource) => {
                const patch = overrides.resources[resource.id] ?? {};
                const status =
                  patch.verificationStatus ?? resource.verificationStatus;
                const url = patch.officialUrl ?? resource.officialUrl;
                const verified = formatDate(
                  patch.lastVerified ?? resource.lastVerified,
                );
                return (
                  <li key={resource.id} className="border-b border-line py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">
                        {resource.name}
                      </span>
                      <span className="label text-faint">
                        {RESOURCE_CATEGORY_BY_ID[resource.category].label}
                      </span>
                      {status === "verified" ? (
                        <Chip>Verified {verified}</Chip>
                      ) : status === "outdated" ? (
                        <Chip tone="danger">Outdated</Chip>
                      ) : (
                        <Chip tone="warn">Needs review</Chip>
                      )}
                      {patch.hidden ? <Chip tone="danger">Hidden</Chip> : null}
                    </div>

                    <form
                      action={setResourceUrl}
                      className="mt-2.5 flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="id" value={resource.id} />
                      <input
                        name="officialUrl"
                        defaultValue={url}
                        aria-label={`Official URL for ${resource.name}`}
                        className="min-w-0 flex-1 rounded-[var(--radius)] border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink focus:border-accent"
                      />
                      <Button
                        variant="secondary"
                        type="submit"
                        className="px-3 py-1.5 text-xs"
                      >
                        Save URL
                      </Button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 text-xs text-accent underline underline-offset-2"
                      >
                        Open
                      </a>
                    </form>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          ["verified", "Mark verified"],
                          ["needs-review", "Needs review"],
                          ["outdated", "Mark outdated"],
                        ] as const
                      ).map(([value, label]) => (
                        <form action={setResourceVerification} key={value}>
                          <input type="hidden" name="id" value={resource.id} />
                          <input type="hidden" name="status" value={value} />
                          <Button
                            variant="ghost"
                            type="submit"
                            className="px-2.5 py-1 text-xs"
                          >
                            {label}
                          </Button>
                        </form>
                      ))}
                      <form action={setResourceHidden}>
                        <input type="hidden" name="id" value={resource.id} />
                        <input
                          type="hidden"
                          name="hidden"
                          value={patch.hidden ? "false" : "true"}
                        />
                        <Button
                          variant="ghost"
                          type="submit"
                          className="px-2.5 py-1 text-xs"
                        >
                          {patch.hidden ? "Show again" : "Hide"}
                        </Button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* ----------------------------------------------- opportunities */}
        {tab === "opportunities" ? (
          <section aria-label="Opportunities">
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Mark a listing verified once you have confirmed the date, cost,
              and eligibility with the organiser. New listings are added in{" "}
              <code className="text-ink">src/content/opportunities.ts</code> and
              ship with a deploy.
            </p>

            <ul className="mt-6 border-t border-line">
              {opportunities.map((item) => {
                const patch = overrides.opportunities[item.id] ?? {};
                const verified = patch.verified ?? item.verified;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 border-b border-line py-3.5"
                  >
                    <span className="flex-1 text-sm font-medium text-ink">
                      {item.title}
                    </span>
                    {verified ? (
                      <Chip>Verified</Chip>
                    ) : (
                      <Chip tone="warn">Unverified</Chip>
                    )}
                    {patch.hidden ? <Chip tone="danger">Hidden</Chip> : null}
                    <form action={setOpportunityFlags}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="field" value="verified" />
                      <input
                        type="hidden"
                        name="value"
                        value={verified ? "false" : "true"}
                      />
                      <Button
                        variant="ghost"
                        type="submit"
                        className="px-2.5 py-1 text-xs"
                      >
                        {verified ? "Un-verify" : "Mark verified"}
                      </Button>
                    </form>
                    <form action={setOpportunityFlags}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="field" value="hidden" />
                      <input
                        type="hidden"
                        name="value"
                        value={patch.hidden ? "false" : "true"}
                      />
                      <Button
                        variant="ghost"
                        type="submit"
                        className="px-2.5 py-1 text-xs"
                      >
                        {patch.hidden ? "Show" : "Hide"}
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* --------------------------------------------------- updates */}
        {tab === "updates" ? (
          <section aria-label="Public updates" className="space-y-8">
            <UpdateEditor />

            <ul className="border-t border-line">
              {updates.map((update) => {
                const status = ISSUE_STATUS_BY_ID[update.status];
                return (
                  <li key={update.id} className="border-b border-line py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPip
                        label={status.label}
                        tone={status.tone as StatusTone}
                      />
                      <span className="label text-faint">
                        {ISSUE_CATEGORY_BY_ID[update.category]?.label}
                      </span>
                      <span className="tnum ml-auto text-xs text-faint">
                        {formatDate(update.dateUpdated)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-ink">
                      {update.title}
                    </h3>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
                      {update.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <UpdateEditor editing={update} />
                      <form action={removeUpdate}>
                        <input type="hidden" name="id" value={update.id} />
                        <Button
                          variant="ghost"
                          type="submit"
                          className="px-2.5 py-1 text-xs text-[color:var(--danger)]"
                        >
                          Remove from the public board
                        </Button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* ---------------------------------------------------- export */}
        {tab === "export" ? (
          <section aria-label="Export" className="max-w-3xl space-y-5">
            <p className="text-sm leading-relaxed text-muted">
              Everything edited here is stored as one overrides document layered
              on top of the seed files. Download it as a backup, or fold the
              values back into <code className="text-ink">src/content/</code> to
              make them permanent.
            </p>
            <p className="text-sm text-muted">
              Last change:{" "}
              <span className="tnum text-ink">
                {overrides.updatedAt
                  ? new Date(overrides.updatedAt).toUTCString()
                  : "never"}
              </span>
            </p>
            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Download overrides JSON
            </a>
            <pre className="max-h-96 overflow-auto rounded-[var(--radius-lg)] border border-line bg-sunken p-4 font-mono text-xs text-muted">
              {JSON.stringify(overrides, null, 2)}
            </pre>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6">
      <Eyebrow>Student Government</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
        Editor
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Content maintenance for Navigate. Students never sign in here.
      </p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
