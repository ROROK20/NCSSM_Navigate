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
 * Two delivery paths, both optional, at least one required:
 *  - a local append-only JSONL file, readable from /admin
 *  - an outbound webhook (Slack, Discord, Zapier, Apps Script) if configured
 *
 * If neither can durably accept the record, `saveSubmission` reports failure and
 * the API returns an error. A submission is never accepted and dropped.
 */

const FILE = "submissions.jsonl";

export interface DeliveryReport {
  /** The record reached durable storage (a real file, not the memory cache). */
  persisted: boolean;
  webhook: "sent" | "failed" | "not-configured";
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
  const webhook = await notifyWebhook(record);

  return {
    record,
    delivery: {
      persisted,
      webhook,
      accepted: persisted || webhook === "sent",
    },
  };
}

/**
 * Optional outbound notification so SG hears about a submission without
 * remembering to check the admin page.
 *
 * Only the title, category, and a short excerpt are sent. Contact details never
 * leave this server: a webhook URL is a shared secret in a chat channel, and a
 * student's email does not belong there.
 */
async function notifyWebhook(
  record: IssueSubmission,
): Promise<DeliveryReport["webhook"]> {
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
