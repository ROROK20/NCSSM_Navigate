"use client";

import type { IssueCategoryId } from "@/content/taxonomy";

/**
 * Where a demo submission goes: the visitor's own browser, and nowhere else.
 *
 * No request is made, nothing reaches the server, and nothing is shared with
 * another visitor. This exists so the whole loop is explorable - fill in the
 * form, get a confirmation, watch the entry appear on the status board - while
 * the site is still a demonstration rather than a service.
 *
 * Shaped as an external store so components can read it through
 * `useSyncExternalStore`: that gives a stable snapshot, a correct empty value
 * during server rendering, and updates without an effect that sets state.
 *
 * Every storage call is guarded. Storage throws outright in some contexts
 * (private windows, blocked site data, thumbnail capture), and a demo that
 * crashes the page is worse than one that forgets.
 */

const KEY = "navigate-demo-submissions";
const LIMIT = 10;

export interface DemoSubmission {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  category: IssueCategoryId;
  location: string | null;
  anonymous: boolean;
}

/** Stable identity, so a server render and an empty client render agree. */
const EMPTY: readonly DemoSubmission[] = Object.freeze([]);

let snapshot: readonly DemoSubmission[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): readonly DemoSubmission[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoSubmission[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(rows: readonly DemoSubmission[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, LIMIT)));
  } catch {
    /* Nothing to do: the demo simply will not remember this one. */
  }
}

/** Re-read and notify. Called after a local write and on another tab's write. */
function invalidate() {
  snapshot = readStorage();
  loaded = true;
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key === null || event.key === KEY) invalidate();
}

/* ------------------------------------------------------- store interface */

export function subscribeDemoSubmissions(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** Must return a referentially stable value between changes. */
export function getDemoSubmissions(): readonly DemoSubmission[] {
  if (!loaded) {
    snapshot = readStorage();
    loaded = true;
  }
  return snapshot;
}

/** The server has no browser storage, so it always renders the empty state. */
export function getDemoSubmissionsOnServer(): readonly DemoSubmission[] {
  return EMPTY;
}

/* ----------------------------------------------------------------- writes */

export function addDemoSubmission(
  input: Omit<DemoSubmission, "id" | "createdAt">,
): DemoSubmission {
  const record: DemoSubmission = {
    ...input,
    // crypto.randomUUID needs a secure context; the fallback keeps a demo on
    // plain http working rather than throwing.
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `demo-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  writeStorage([record, ...getDemoSubmissions()]);
  invalidate();
  return record;
}

export function clearDemoSubmissions() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Best effort, same as above. */
  }
  invalidate();
}
