import "server-only";
import { resources as seedResources } from "@/content/resources";
import { opportunities as seedOpportunities } from "@/content/opportunities";
import { sgUpdates as seedUpdates } from "@/content/updates";
import { sgFeed as seedFeed } from "@/content/sg-feed";
import type {
  Opportunity,
  Resource,
  SgFeedEntry,
  SgUpdate,
} from "@/content/types";
import {
  ISSUE_CATEGORY_IDS,
  ISSUE_STATUS_IDS,
  SG_FEED_KIND_IDS,
  SG_PROPOSAL_STAGE_IDS,
} from "@/content/taxonomy";
import { readJson, writeJson } from "./store";

/**
 * Reads content, with editor changes layered over the seed files.
 *
 * Seed data in `src/content/*.ts` is the baseline and always ships with the
 * build. The admin page writes an overrides document that is merged on top at
 * read time. That gives editors a live workflow without turning the repo into a
 * CMS, and keeps the seed files readable as the source of truth.
 *
 * To promote overrides into the repo permanently, export them from /admin and
 * fold the values back into the seed files.
 */

const OVERRIDES_FILE = "content-overrides.json";

/** Only the fields an editor can change from the admin UI. */
export interface ResourcePatch {
  officialUrl?: string;
  verificationStatus?: Resource["verificationStatus"];
  lastVerified?: string | null;
  hidden?: boolean;
}

export interface OpportunityPatch {
  verified?: boolean;
  hidden?: boolean;
}

export interface ContentOverrides {
  resources: Record<string, ResourcePatch>;
  opportunities: Record<string, OpportunityPatch>;
  /** Full records. Upserting an id that exists in the seed replaces it. */
  updateUpserts: SgUpdate[];
  updateRemovals: string[];
  updatedAt: string | null;
}

export const EMPTY_OVERRIDES: ContentOverrides = {
  resources: {},
  opportunities: {},
  updateUpserts: [],
  updateRemovals: [],
  updatedAt: null,
};

export async function getOverrides(): Promise<ContentOverrides> {
  const stored = await readJson<Partial<ContentOverrides>>(OVERRIDES_FILE, {});
  return { ...EMPTY_OVERRIDES, ...stored };
}

export async function saveOverrides(next: ContentOverrides) {
  await writeJson(OVERRIDES_FILE, {
    ...next,
    updatedAt: new Date().toISOString(),
  });
}

/* ------------------------------------------------------------- read paths */

export async function getResources(): Promise<Resource[]> {
  const { resources: patches } = await getOverrides();
  return seedResources
    .map((resource) => {
      const patch = patches[resource.id];
      return patch ? { ...resource, ...stripHidden(patch) } : resource;
    })
    .filter((resource) => !patches[resource.id]?.hidden);
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const { opportunities: patches } = await getOverrides();
  return seedOpportunities
    .map((item) => {
      const patch = patches[item.id];
      return patch ? { ...item, ...stripHidden(patch) } : item;
    })
    .filter((item) => !patches[item.id]?.hidden);
}

/**
 * Public status entries typed into the Google Sheet's "Updates" tab.
 *
 * Optional. Without a store configured this returns nothing and the seed file
 * plus the editor's overrides carry the board exactly as before.
 *
 * It exists because Vercel has no writable disk, so entries written in /admin
 * vanish on the next deploy. A spreadsheet is also a better tool to hand to
 * next year's officers than a TypeScript file.
 *
 * Every failure is swallowed on purpose. A status board that 500s because a
 * spreadsheet was slow is worse than one showing slightly stale entries.
 */
async function fetchSheetUpdates(): Promise<SgUpdate[]> {
  const store = process.env.ISSUE_STORE_URL;
  if (!store) return [];

  try {
    const url = new URL(store);
    url.searchParams.set("sheet", "updates");

    const response = await fetch(url, {
      // Re-read a few times an hour rather than on every request.
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];

    const data: unknown = await response.json();
    const rows =
      data && typeof data === "object" && "updates" in data
        ? (data as { updates: unknown }).updates
        : null;
    if (!Array.isArray(rows)) return [];

    return rows.flatMap((row): SgUpdate[] => {
      if (!row || typeof row !== "object") return [];
      const r = row as Record<string, string>;
      const valid =
        r.id &&
        r.title &&
        (ISSUE_CATEGORY_IDS as readonly string[]).includes(r.category) &&
        (ISSUE_STATUS_IDS as readonly string[]).includes(r.status);
      if (!valid) return [];
      return [
        {
          id: r.id,
          title: r.title,
          category: r.category as SgUpdate["category"],
          status: r.status as SgUpdate["status"],
          dateUpdated: /^\d{4}-\d{2}-\d{2}$/.test(r.dateUpdated)
            ? r.dateUpdated
            : new Date().toISOString().slice(0, 10),
          summary: r.summary ?? "",
          nextStep: r.nextStep ? r.nextStep : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function getUpdates(): Promise<SgUpdate[]> {
  const [{ updateUpserts, updateRemovals }, sheetUpdates] = await Promise.all([
    getOverrides(),
    fetchSheetUpdates(),
  ]);

  // Seed first, then the spreadsheet, then anything typed in /admin. Later
  // layers win on a matching id.
  const byId = new Map<string, SgUpdate>();
  for (const update of seedUpdates) byId.set(update.id, update);
  for (const update of sheetUpdates) byId.set(update.id, update);
  for (const update of updateUpserts) byId.set(update.id, update);
  for (const id of updateRemovals) byId.delete(id);
  return [...byId.values()].sort((a, b) =>
    b.dateUpdated.localeCompare(a.dateUpdated),
  );
}

/**
 * Student Government's own activity, typed into the Sheet's "Feed" tab.
 *
 * Same contract as the status board above: optional, cached for a few minutes,
 * and every failure swallowed. A transparency page that 500s because a
 * spreadsheet was slow has failed at the one thing it exists to do.
 */
async function fetchSheetFeed(): Promise<SgFeedEntry[]> {
  const store = process.env.ISSUE_STORE_URL;
  if (!store) return [];

  try {
    const url = new URL(store);
    url.searchParams.set("sheet", "feed");

    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];

    const data: unknown = await response.json();
    const rows =
      data && typeof data === "object" && "feed" in data
        ? (data as { feed: unknown }).feed
        : null;
    if (!Array.isArray(rows)) return [];

    return rows.flatMap((row): SgFeedEntry[] => {
      if (!row || typeof row !== "object") return [];
      const r = row as Record<string, string>;
      if (!r.id || !r.title) return [];
      if (!(SG_FEED_KIND_IDS as readonly string[]).includes(r.kind)) return [];

      // A stage only means anything on a proposal, and an unrecognised one is
      // dropped rather than rendered as an unlabelled pip.
      const stage =
        r.kind === "proposal" &&
        (SG_PROPOSAL_STAGE_IDS as readonly string[]).includes(r.stage)
          ? (r.stage as SgFeedEntry["stage"])
          : null;

      return [
        {
          id: r.id,
          kind: r.kind as SgFeedEntry["kind"],
          date: /^\d{4}-\d{2}-\d{2}$/.test(r.date)
            ? r.date
            : new Date().toISOString().slice(0, 10),
          title: r.title,
          body: r.body ?? "",
          stage,
          example: /^(true|yes|y|1|x)$/i.test(String(r.example ?? "").trim()),
        },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * The transparency feed: the spreadsheet if it has anything, the examples if
 * it does not.
 *
 * Deliberately a replacement rather than a merge, which is the opposite of how
 * the status board layers its sources. The seed rows here are labelled
 * examples, and an example meeting sitting in a list of real ones is exactly
 * the confusion this page cannot afford. The moment officers have typed a
 * single row, the placeholders are gone.
 */
export async function getSgFeed(): Promise<SgFeedEntry[]> {
  const sheetFeed = await fetchSheetFeed();
  const rows = sheetFeed.length > 0 ? sheetFeed : seedFeed;
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
}

/** `hidden` controls filtering; it must not be spread onto the record itself. */
function stripHidden<T extends { hidden?: boolean }>(patch: T) {
  const rest: Record<string, unknown> = { ...patch };
  delete rest.hidden;
  return rest as Omit<T, "hidden">;
}

/* ------------------------------------------------- admin-side seed access */

/** Unfiltered seed rows, so the admin page can show what it has hidden. */
export function getSeedResources() {
  return seedResources;
}
export function getSeedOpportunities() {
  return seedOpportunities;
}
export function getSeedUpdates() {
  return seedUpdates;
}
