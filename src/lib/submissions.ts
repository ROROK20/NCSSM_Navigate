import "server-only";
import { randomUUID } from "node:crypto";
import type { IssueSubmission } from "@/content/types";
import type { IssueCategoryId } from "@/content/taxonomy";
import type { IssueSubmissionParsed } from "./validation";
import { appendLine, readLines, replaceLines, storageMode } from "./store";

/**
 * Where issue submissions go.
 *
 * This is the only module that touches submission content. Nothing here is ever
 * imported by a public page, and no public route reads from it.
 *
 * Three delivery paths, all optional, at least one required:
 *
 *  - `disk`   an append-only JSONL file, readable from /admin. Works on any
 *             host with a writable filesystem. Not available on Vercel.
 *  - `store`  ISSUE_STORE_URL. Receives the FULL record, contact included, so
 *             it can serve as the system of record. Point it at something SG
 *             controls, such as an Apps Script bound to a private Google Sheet.
 *  - `notify` ISSUE_WEBHOOK_URL. Receives a short notice with NO contact
 *             details, for a chat channel. Never the system of record.
 *
 * The split between `store` and `notify` is deliberate. A chat webhook URL is a
 * bearer token sitting in a channel many people can see; a student's email does
 * not belong there. The system of record is a separate, deliberate choice.
 *
 * If no durable path accepts the record, `saveSubmission` reports failure and
 * the API returns an error. A submission is never accepted and dropped.
 */

const FILE = "submissions.jsonl";

type Delivery = "sent" | "failed" | "not-configured";

export interface DeliveryReport {
  /** The record reached a real file, not the per-instance memory cache. */
  persisted: boolean;
  /** The system of record accepted the full record. */
  store: Delivery;
  /** The notification channel was told, without contact details. */
  webhook: Delivery;
  /** True when at least one durable path accepted it. */
  accepted: boolean;
}

export async function saveSubmission(
  input: IssueSubmissionParsed,
): Promise<{ record: IssueSubmission; delivery: DeliveryReport }> {
  const record: IssueSubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    title: input.title,
    description: input.description,
    category: input.category as IssueCategoryId,
    location: input.location?.trim() ? input.location.trim() : null,
    // Contact is dropped entirely when the student chose anonymity, rather
    // than stored and hidden. If it is not written down it cannot leak.
    contact: input.anonymous ? null : (input.contact?.trim() ?? null) || null,
    anonymous: input.anonymous,
    triage: "new",
  };

  await appendLine(FILE, record);
  const persisted = storageMode().mode === "file";

  // Both outbound calls run regardless of whether the disk write worked, so a
  // host with a disk still gets its chat notification.
  const [store, webhook] = await Promise.all([
    sendToStore(record),
    notifyWebhook(record),
  ]);

  return {
    record,
    delivery: {
      persisted,
      store,
      webhook,
      accepted: persisted || store === "sent",
    },
  };
}

/**
 * The system of record, when the host has no writable disk.
 *
 * Sends the complete record, contact details included, which is why this is a
 * separate variable from the chat webhook. Configure it only with an endpoint
 * SG controls and can restrict.
 */
async function sendToStore(record: IssueSubmission): Promise<Delivery> {
  const url = process.env.ISSUE_STORE_URL;
  if (!url) return "not-configured";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Optional shared secret so a leaked URL alone cannot write rows.
        // Google Apps Script cannot read custom headers; for that sink, put
        // the token in the ISSUE_STORE_URL query string instead.
        ...(process.env.ISSUE_STORE_TOKEN
          ? { "x-navigate-token": process.env.ISSUE_STORE_TOKEN }
          : {}),
      },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.warn(`[navigate] store responded ${response.status}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    // Never log the record itself on failure.
    console.warn(
      `[navigate] store delivery failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return "failed";
  }
}

/**
 * Optional outbound notification so SG hears about a submission without
 * remembering to check the admin page.
 *
 * Only the title, category, and a short excerpt are sent. Contact details never
 * leave this server: a webhook URL is a shared secret in a chat channel, and a
 * student's email does not belong there.
 */
async function notifyWebhook(record: IssueSubmission): Promise<Delivery> {
  const url = process.env.ISSUE_WEBHOOK_URL;
  if (!url) return "not-configured";

  const excerpt =
    record.description.length > 240
      ? `${record.description.slice(0, 240)}...`
      : record.description;

  const summary = [
    `New issue submitted to NCSSM Navigate`,
    `Category: ${record.category}`,
    record.location ? `Location: ${record.location}` : null,
    record.anonymous ? "Submitted anonymously" : "Contact details on file",
    "",
    record.title,
    excerpt,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // `text` suits Slack and Discord; `content` is Discord's field name.
      body: JSON.stringify({
        text: summary,
        content: summary,
        id: record.id,
        category: record.category,
        anonymous: record.anonymous,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn(`[navigate] webhook responded ${response.status}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    // Never log the submission body on failure.
    console.warn(
      `[navigate] webhook delivery failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return "failed";
  }
}

/**
 * Which delivery paths are configured. Used by /admin to tell an editor what
 * will actually happen to a submission on this deployment.
 */
export function deliveryConfig() {
  return {
    store: Boolean(process.env.ISSUE_STORE_URL),
    webhook: Boolean(process.env.ISSUE_WEBHOOK_URL),
  };
}

/* ------------------------------------------------------------ admin reads */

/** Admin-only. Callers must verify the editor session before calling this. */
export async function listSubmissions(): Promise<IssueSubmission[]> {
  const rows = await readLines<IssueSubmission>(FILE);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setTriage(id: string, triage: IssueSubmission["triage"]) {
  const rows = await readLines<IssueSubmission>(FILE);
  const next = rows.map((row) => (row.id === id ? { ...row, triage } : row));
  await replaceLines(FILE, next);
  return next.find((row) => row.id === id) ?? null;
}

/**
 * Permanent deletion, used once an issue has been actioned and SG no longer
 * needs the original words. Keeping submissions forever is a privacy liability.
 */
export async function deleteSubmission(id: string) {
  const rows = await readLines<IssueSubmission>(FILE);
  await replaceLines(
    FILE,
    rows.filter((row) => row.id !== id),
  );
}
