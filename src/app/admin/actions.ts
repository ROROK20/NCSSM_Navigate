"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  adminConfigured,
  checkPassword,
  endSession,
  requireEditor,
  startSession,
} from "@/lib/admin-auth";
import { getOverrides, saveOverrides } from "@/lib/content";
import { deleteSubmission, setTriage } from "@/lib/submissions";
import { clientKey, peekRateLimit, rateLimit } from "@/lib/rate-limit";
import { todayIso } from "@/lib/format";
import { ISSUE_CATEGORY_IDS, ISSUE_STATUS_IDS } from "@/content/taxonomy";
import type { IssueCategoryId, IssueStatusId } from "@/content/taxonomy";
import type { SgUpdate, VerificationStatus } from "@/content/types";

/**
 * Every admin mutation lives here as a Server Action.
 *
 * Each one calls `requireEditor()` first. That check runs on the server on every
 * invocation; hiding the UI is not, and must never be, the access control.
 */

export type ActionState = { ok: boolean; message: string } | null;

/** Wrong-password budget per client network. Correct sign-ins never spend it. */
const LOGIN_FAILURE_LIMIT = 10;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;

/** Refresh every surface that reads merged content. */
function revalidateContent() {
  for (const path of ["/", "/resources", "/opportunities", "/updates", "/admin"]) {
    revalidatePath(path);
  }
}

/* ------------------------------------------------------------------ auth */

export async function signIn(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!adminConfigured()) {
    return {
      ok: false,
      message:
        "Admin is disabled because ADMIN_PASSWORD is not set (it must be at least 12 characters).",
    };
  }

  // Throttle brute force against the shared secret, counting failures only.
  //
  // Officers signing in from campus wifi all share one public IP, so charging
  // the budget for successful sign-ins would let a handful of normal logins
  // lock out everyone else. Only wrong guesses cost anything.
  const key = createHash("sha256")
    .update(clientKey(await headers()))
    .digest("hex")
    .slice(0, 32);

  const bucket = `admin-login:${key}`;
  if (!peekRateLimit(bucket, LOGIN_FAILURE_LIMIT).ok) {
    return {
      ok: false,
      message: "Too many wrong passwords from this network. Try again later.",
    };
  }

  const candidate = String(formData.get("password") ?? "");
  if (!checkPassword(candidate)) {
    rateLimit(bucket, LOGIN_FAILURE_LIMIT, LOGIN_FAILURE_WINDOW_MS);
    return { ok: false, message: "That password is not right." };
  }

  await startSession();
  revalidatePath("/admin");
  return { ok: true, message: "Signed in." };
}

export async function signOut(): Promise<void> {
  await endSession();
  revalidatePath("/admin");
}

/* ------------------------------------------------------------- resources */

export async function setResourceVerification(
  formData: FormData,
): Promise<void> {
  await requireEditor();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as VerificationStatus;
  if (!id) return;
  if (!["verified", "needs-review", "outdated"].includes(status)) return;

  const overrides = await getOverrides();
  overrides.resources[id] = {
    ...overrides.resources[id],
    verificationStatus: status,
    // Stamp the check date on a positive confirmation only. Marking something
    // broken is not evidence the link was verified.
    lastVerified:
      status === "verified"
        ? todayIso()
        : (overrides.resources[id]?.lastVerified ?? null),
  };

  await saveOverrides(overrides);
  revalidateContent();
}

export async function setResourceHidden(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "") === "true";
  if (!id) return;

  const overrides = await getOverrides();
  overrides.resources[id] = { ...overrides.resources[id], hidden };
  await saveOverrides(overrides);
  revalidateContent();
}

export async function setResourceUrl(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("officialUrl") ?? "").trim();
  if (!id || !url) return;

  // Only absolute http(s) links or in-site paths. This blocks javascript: and
  // data: URLs, which would otherwise become a stored-XSS vector via the
  // rendered anchor.
  const allowed =
    url.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(url);
  if (!allowed) return;

  const overrides = await getOverrides();
  overrides.resources[id] = {
    ...overrides.resources[id],
    officialUrl: url,
    // Changing the destination invalidates any previous verification.
    verificationStatus: "needs-review",
    lastVerified: null,
  };
  await saveOverrides(overrides);
  revalidateContent();
}

/* --------------------------------------------------------- opportunities */

export async function setOpportunityFlags(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const overrides = await getOverrides();
  const current = overrides.opportunities[id] ?? {};
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "") === "true";

  if (field === "verified") current.verified = value;
  else if (field === "hidden") current.hidden = value;
  else return;

  overrides.opportunities[id] = current;
  await saveOverrides(overrides);
  revalidateContent();
}

/* --------------------------------------------------------------- updates */

export async function saveUpdate(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireEditor();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const status = String(formData.get("status") ?? "");
  const nextStep = String(formData.get("nextStep") ?? "").trim();
  const existingId = String(formData.get("id") ?? "").trim();

  if (title.length < 6) {
    return { ok: false, message: "Give the update a longer title." };
  }
  if (summary.length < 20) {
    return { ok: false, message: "The public summary needs more detail." };
  }
  if (!(ISSUE_CATEGORY_IDS as readonly string[]).includes(category)) {
    return { ok: false, message: "Pick a category." };
  }
  if (!(ISSUE_STATUS_IDS as readonly string[]).includes(status)) {
    return { ok: false, message: "Pick a status." };
  }

  const record: SgUpdate = {
    id: existingId || `u-${Date.now().toString(36)}`,
    title,
    summary,
    category: category as IssueCategoryId,
    status: status as IssueStatusId,
    dateUpdated: todayIso(),
    nextStep: nextStep || null,
  };

  const overrides = await getOverrides();
  overrides.updateUpserts = [
    ...overrides.updateUpserts.filter((row) => row.id !== record.id),
    record,
  ];
  overrides.updateRemovals = overrides.updateRemovals.filter(
    (id) => id !== record.id,
  );

  await saveOverrides(overrides);
  revalidateContent();
  return { ok: true, message: existingId ? "Update saved." : "Update posted." };
}

export async function removeUpdate(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const overrides = await getOverrides();
  overrides.updateUpserts = overrides.updateUpserts.filter(
    (row) => row.id !== id,
  );
  if (!overrides.updateRemovals.includes(id)) {
    overrides.updateRemovals.push(id);
  }
  await saveOverrides(overrides);
  revalidateContent();
}

/* ----------------------------------------------------------- submissions */

export async function triageSubmission(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const triage = String(formData.get("triage") ?? "");
  if (!id) return;
  if (!["new", "reviewed", "published", "closed"].includes(triage)) return;

  await setTriage(id, triage as "new" | "reviewed" | "published" | "closed");
  revalidatePath("/admin");
}

/**
 * Permanent deletion. Submissions are a privacy liability once actioned, so
 * removing them is part of the workflow rather than an afterthought.
 */
export async function removeSubmission(formData: FormData): Promise<void> {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteSubmission(id);
  revalidatePath("/admin");
}
