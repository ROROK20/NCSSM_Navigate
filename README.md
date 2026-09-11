# NCSSM Navigate

One place for NCSSM-Durham students to find resources, opportunities, support,
and student-government updates, without having to know which platform,
department, or person to search for.

Built and maintained by Student Government. Not an official school system.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run verify` | lint + typecheck + build, in that order |
| `npm run test:e2e` | Playwright end-to-end suite (builds and serves on port 3100) |

First time running the tests: `npx playwright install chromium`.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind
CSS v4, Zod. No database.

---

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage: four primary actions, how it works, featured content |
| `/resources` | Searchable, filterable resource directory |
| `/opportunities` | Searchable, filterable opportunities directory |
| `/report` | Issue submission form, anonymous option |
| `/updates` | Public status board for issues SG is handling |
| `/sg` | What SG does, contact, meetings, documents, Senate |
| `/admin` | Editor tools. Password-gated, `noindex` |

---

## Updating content

All content lives in `src/content/`. These are plain TypeScript files with
comments explaining each field. Editing one and redeploying is the normal way to
change the site.

| File | Holds |
| --- | --- |
| `src/content/resources.ts` | The resource directory |
| `src/content/opportunities.ts` | The opportunities directory |
| `src/content/updates.ts` | Public SG status entries |
| `src/content/site.ts` | Site name, SG contact email, meetings, documents, Senate roster |
| `src/content/taxonomy.ts` | Categories, statuses, platforms |
| `src/content/types.ts` | The shape of every record |

### Adding a resource

Append to the array in `src/content/resources.ts`:

```ts
{
  id: "unique-slug",
  name: "Writing Center",
  description: "One or two plain sentences. No jargon.",
  category: "academic-support",        // must exist in taxonomy.ts
  officialUrl: "https://www.ncssm.edu/...",
  audience: "All students",
  loginRequired: false,                // true if it lands on an NCSSM sign-in
  platform: "web",                     // web | blackbaud | canvas | google | email | form | phone | other
  lastVerified: null,                  // set by an editor from /admin
  verificationStatus: "needs-review",  // verified | needs-review | outdated
  featured: false,                     // shows on the homepage
}
```

Rules that matter:

- `officialUrl` must be the school's own address. Never mirror, proxy, cache, or
  re-host anything that sits behind an NCSSM login.
- Set `loginRequired: true` whenever the destination asks for an NCSSM account.
  The student authenticates on that platform, never here.
- `contactEmail` is for offices and departments only, never an individual
  student.

Adding a new category means adding one entry to `taxonomy.ts`. Filters, counts,
tags, and dropdowns all read from there, so nothing else needs editing.

### The editor at `/admin`

Sign in with `ADMIN_PASSWORD`. Five tabs:

- **Submissions** — read, triage, and permanently delete issue submissions.
- **Resources** — open each link, then mark it verified, needs review, or
  outdated. Verifying stamps today's date, which shows on the public directory.
  You can correct a URL or hide a row here too.
- **Opportunities** — mark a listing verified once confirmed with the organiser;
  hide a listing.
- **Public updates** — write and edit status-board entries.
- **Export** — download everything the editor has changed as one JSON file.

Editor changes are stored as an overrides document layered on top of the seed
files at read time, so they take effect immediately with no redeploy. To make
them permanent, export the JSON and fold the values back into `src/content/`.

**This depends on the host having a writable disk.** If it does not, the admin
page shows a red warning at the top and changes last only until the next
restart. See Deployment.

---

## How issue submissions are handled

A student posts the form to `POST /api/issues`. The route:

1. Throttles per client network. The accepted-submission budget (5/hour) is only
   spent on submissions that are actually stored, so failing validation five
   times does not lock anyone out. A separate looser budget stops hammering.
2. Rejects a filled honeypot field and implausibly fast posts.
3. Validates and sanitises with the Zod schema in `src/lib/validation.ts`,
   server-side. The client check is a convenience, not a control.
4. Delivers, then reports honestly.

Two delivery paths, at least one required:

- **Disk** — appended to `submissions.jsonl` in the data directory, readable
  from `/admin`.
- **Webhook** — if `ISSUE_WEBHOOK_URL` is set, a short notice is POSTed there
  (Slack, Discord, Zapier, Google Apps Script). Only the title, category, and a
  truncated excerpt are sent. **Contact details never leave the server.**

If neither path can durably accept the record, the API returns 503 and the form
tells the student it was **not** received, pointing them at the SG email
instead. A submission is never accepted and silently dropped.

### Privacy rules the code enforces

- Submissions are never rendered on any public page or served by any public
  route. `GET /api/issues` returns 405 on purpose. There is an end-to-end test
  (`e2e/report.spec.ts`) that submits a marker string and asserts it appears on
  no public page.
- Choosing anonymous stores `contact: null`. The value is dropped, not hidden,
  so there is nothing to leak later.
- Public status entries are written from scratch by SG. Nothing is copied from a
  submission. The admin form says so next to the textarea.
- Client IPs are hashed before use as a rate-limit key and are never stored.
- Submission bodies are never written to logs, including on webhook failure.
- Delete submissions from `/admin` once actioned. Keeping them indefinitely is a
  privacy liability with no upside.

---

## Environment variables

See `.env.example`. `.env.local` is gitignored; never commit it.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | For `/admin` | Shared editor password, minimum 12 characters. **There is no default** — the editor is disabled until this is set. |
| `ADMIN_SESSION_SECRET` | No | Signs editor session cookies. Falls back to `ADMIN_PASSWORD`. Set it separately so rotating one does not invalidate the other. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Absolute public origin, for canonical URLs, the sitemap, and social cards. |
| `NAVIGATE_DATA_DIR` | No | Where the JSON/JSONL files live. Defaults to `./.data`. Point at a mounted volume on hosts whose app directory is read-only. |
| `ISSUE_WEBHOOK_URL` | No | Receives a short notice per submission. |

---

## Deployment

The choice that matters is whether the host gives you a **writable disk**,
because that is what persists submissions and editor changes.

### Option A — a host with a persistent disk (recommended)

Render, Railway, Fly.io, a VPS, or any Docker host with a volume. Everything
works: submissions persist, editor changes persist.

```bash
npm ci
npm run build
npm run start            # honours $PORT
```

Set `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, and point
`NAVIGATE_DATA_DIR` at the mounted volume (for example `/data`). Node.js 20.9 or
newer.

### Option B — Vercel

```bash
npm i -g vercel
vercel            # first deploy, links the project
vercel --prod
```

Set the environment variables in the Vercel dashboard under Project Settings →
Environment Variables.

**Vercel's filesystem is read-only, so you must set `ISSUE_WEBHOOK_URL`**, or
the submission form will correctly refuse every submission with a 503. With the
webhook set, submissions are delivered reliably to your channel. Editor changes
at `/admin` will still work for the life of an instance but will not persist;
use the Export tab and commit the JSON, or edit `src/content/` and redeploy.

### After any deploy, check these four things

1. Open `/` and confirm the page renders.
2. Submit a test issue at `/report` and confirm you get the green success panel,
   not an error. Then confirm it arrived (in `/admin` → Submissions, or in your
   webhook channel).
3. Sign in at `/admin` and confirm there is no red storage warning at the top.
4. Delete the test submission.

---

## Before public launch

Seed data is clearly labelled in the UI and in code comments. Replace it:

- [ ] Replace every URL in `src/content/resources.ts` with a confirmed official
      link, then mark each one verified in `/admin`.
- [ ] Replace `site.contact.email` in `src/content/site.ts` with a real,
      monitored SG address.
- [ ] Confirm Senate and officer meeting details in `site.ts`, or delete the
      section.
- [ ] Replace the placeholder Senate roster in `sgSenate`, or delete it.
- [ ] Replace the SG document links, and confirm which are public and which are
      internal.
- [ ] Replace the example opportunities with confirmed listings.
- [ ] Remove `<SeedNotice />` from `src/app/page.tsx` and `/resources`, and drop
      the preview sentence from the `/opportunities` callout, once the data is
      real.
- [ ] Set a strong `ADMIN_PASSWORD` and a separate `ADMIN_SESSION_SECRET`.
- [ ] Agree who monitors submissions, how fast, and what happens during breaks.

---

## Not in this release, by design

- **No student login.** The site is fully usable without one. `src/lib/admin-auth.ts`
  is the seam where Google OAuth/OIDC would go; restricting sign-in to approved
  NCSSM domains belongs in that implementation, driven by configuration rather
  than a hardcoded domain.
- **No Canvas, Blackbaud, or Drive integration.** Navigate stores the official
  link, a description, the platform name, and a "NCSSM login required" label, and
  sends the student to that platform to authenticate. Nothing behind those logins
  is scraped, proxied, cached, or stored. A Canvas integration would need school
  approval, developer credentials, and minimum-necessary API scopes.
- **No database.** See `src/lib/store.ts`; it is a small, replaceable seam.

---

## Project layout

```
src/
  app/                     routes (App Router)
    api/issues/            submission endpoint
    api/admin/export/      editor-only overrides download
    admin/                 editor UI and server actions
  components/              presentation, no data access
  content/                 all editable content and taxonomies
  lib/                     validation, storage, auth, formatting, search
e2e/                       Playwright tests
```

`content/` holds data, `components/` holds presentation, `lib/` holds behaviour.
Keeping those apart is what makes the content swappable.
