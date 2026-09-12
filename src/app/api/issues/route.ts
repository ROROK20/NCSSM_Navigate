import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { fieldErrors, issueSubmissionSchema } from "@/lib/validation";
import { clientKey, peekRateLimit, rateLimit } from "@/lib/rate-limit";
import { saveSubmission } from "@/lib/submissions";
import { acceptsSubmissions } from "@/content/stage";

/**
 * POST /api/issues — accept one issue submission.
 *
 * Layers, in order:
 *  1. rate limit per client (hashed, never stored raw)
 *  2. honeypot + minimum time-on-form
 *  3. schema validation and sanitisation
 *  4. durable delivery, or an honest failure
 *
 * The response never echoes the submitted content back.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Two buckets, because they guard different things.
 *
 * ACCEPTED counts only submissions that were actually stored, so a student who
 * fumbles the form five times is not locked out for an hour.
 * ATTEMPT counts every request, including rejected ones, to stop hammering.
 */
const ACCEPTED_LIMIT = 5;
const ACCEPTED_WINDOW_MS = 60 * 60 * 1000;
const ATTEMPT_LIMIT = 40;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Floor on how fast the form can plausibly be completed by a person.
 *
 * Kept low on purpose. Someone pasting a description they wrote elsewhere can
 * be quick, and a false rejection here is a dead end for a real student. Instant
 * scripted posts are still caught, and the honeypot does the heavier lifting.
 * A rejected submitter who simply retries succeeds, because the form has by
 * then been on screen longer.
 */
const MIN_ELAPSED_MS = 1200;

export async function POST(request: Request) {
  /*
   * Refuse everything while the site is a proposal rather than a service.
   *
   * This is first, before validation, before rate limiting, before anything
   * touches storage. A student issue submitted to a candidate's project would
   * land in a queue nobody holds the office to act on, and some of these
   * reports are about safety or mental health. Not collecting them is the
   * correct behaviour, and it has to be enforced here rather than by hiding
   * the form, because the form is not a security boundary.
   */
  if (!acceptsSubmissions) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_accepting",
        message:
          "This site is a proposal and cannot take issue reports yet. Nothing was stored. Please raise this with Student Government directly.",
      },
      { status: 503 },
    );
  }

  // Hashed so no raw IP is held in memory or written to a log.
  const key = createHash("sha256")
    .update(clientKey(request.headers))
    .digest("hex")
    .slice(0, 32);

  const attempts = rateLimit(
    `issues:attempt:${key}`,
    ATTEMPT_LIMIT,
    ATTEMPT_WINDOW_MS,
  );
  if (!attempts.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message: "Too many requests. Wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: { "retry-after": String(attempts.retryAfterSeconds) },
      },
    );
  }

  // Peek without consuming: the accepted-submission budget is only spent on a
  // submission that actually gets stored, at the end of this handler.
  const budget = peekRateLimit(`issues:accepted:${key}`, ACCEPTED_LIMIT);
  if (!budget.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message:
          "That is several submissions in a short time. Try again later, or email Student Government directly.",
      },
      {
        status: 429,
        headers: { "retry-after": String(budget.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_request", message: "Could not read that form." },
      { status: 400 },
    );
  }

  const parsed = issueSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    // A filled honeypot is a bot. Return the generic shape so it learns nothing.
    if (errors.website) {
      return NextResponse.json(
        { ok: false, error: "rejected", message: "Submission rejected." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "validation",
        message: "Some fields need attention.",
        errors,
      },
      { status: 400 },
    );
  }

  const elapsed = parsed.data.elapsedMs;
  if (typeof elapsed === "number" && elapsed < MIN_ELAPSED_MS) {
    return NextResponse.json(
      { ok: false, error: "rejected", message: "Submission rejected." },
      { status: 400 },
    );
  }

  try {
    const { delivery } = await saveSubmission(parsed.data);

    if (!delivery.accepted) {
      // Nothing durable took the record, so do not claim it was received.
      return NextResponse.json(
        {
          ok: false,
          error: "storage_unavailable",
          message:
            "This site could not save your submission, so it has not been received. Nothing was stored. Please email Student Government instead.",
        },
        { status: 503 },
      );
    }

    // Spend the budget only now that the record is durably stored.
    rateLimit(`issues:accepted:${key}`, ACCEPTED_LIMIT, ACCEPTED_WINDOW_MS);

    return NextResponse.json({
      ok: true,
      message: "Submission received.",
      // Tells the UI whether SG was pinged, without exposing the webhook.
      notified: delivery.webhook === "sent",
    });
  } catch (error) {
    console.error(
      `[navigate] submission failed: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    return NextResponse.json(
      {
        ok: false,
        error: "server_error",
        message:
          "Something broke on our side and your submission was not saved. Please email Student Government instead.",
      },
      { status: 500 },
    );
  }
}

/** Nothing here is readable. Say so explicitly rather than 405-ing vaguely. */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "not_readable",
      message: "Issue submissions are never served publicly.",
    },
    { status: 405 },
  );
}
