import "server-only";
import { resources as seedResources } from "@/content/resources";
import { opportunities as seedOpportunities } from "@/content/opportunities";
import { sgUpdates as seedUpdates } from "@/content/updates";
import type { Opportunity, Resource, SgUpdate } from "@/content/types";
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

export async function getUpdates(): Promise<SgUpdate[]> {
  const { updateUpserts, updateRemovals } = await getOverrides();
  const byId = new Map<string, SgUpdate>();
  for (const update of seedUpdates) byId.set(update.id, update);
  for (const update of updateUpserts) byId.set(update.id, update);
  for (const id of updateRemovals) byId.delete(id);
  return [...byId.values()].sort((a, b) =>
    b.dateUpdated.localeCompare(a.dateUpdated),
  );
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
