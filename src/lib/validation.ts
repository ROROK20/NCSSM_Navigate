import { z } from "zod";
import { ISSUE_CATEGORY_IDS } from "@/content/taxonomy";

/**
 * Issue submission schema, shared by the form and the API route.
 *
 * The client uses it for inline errors; the server re-validates because a
 * client-side check is a convenience, never a control.
 */

/**
 * Strip control characters (except tab and newline) and collapse runaway
 * whitespace, so a pasted blob cannot smuggle terminal escapes into the admin
 * view or blow the record out to nonsense.
 */
const clean = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]{3,}/g, "  ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

export const MAX = {
  title: 120,
  description: 4000,
  location: 120,
  contact: 160,
} as const;

export const issueSubmissionSchema = z
  .object({
    title: z
      .string()
      .transform(clean)
      .pipe(
        z
          .string()
          .min(8, "Give the issue a title of at least 8 characters.")
          .max(MAX.title, `Keep the title under ${MAX.title} characters.`),
      ),

    description: z
      .string()
      .transform(clean)
      .pipe(
        z
          .string()
          .min(
            25,
            "Add a bit more detail so SG can tell what is actually happening.",
          )
          .max(
            MAX.description,
            `Keep the description under ${MAX.description} characters.`,
          ),
      ),

    category: z.enum(ISSUE_CATEGORY_IDS as [string, ...string[]], {
      message: "Choose a category.",
    }),

    location: z
      .string()
      .transform(clean)
      .pipe(z.string().max(MAX.location, "That location is too long."))
      .optional(),

    contact: z
      .string()
      .transform(clean)
      .pipe(z.string().max(MAX.contact, "That contact is too long."))
      .optional(),

    anonymous: z.boolean(),

    consent: z.literal(true, {
      message: "You need to acknowledge how submissions are handled.",
    }),

    /** Honeypot. Real people never see this field, so it must stay empty. */
    website: z.string().max(0, "Rejected.").optional(),

    /** Milliseconds the form was on screen. Blocks instant scripted posts. */
    elapsedMs: z.number().int().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
    // A non-anonymous submission with no way to reach the student is almost
    // always a mistake; say so rather than silently losing the follow-up.
    if (!value.anonymous && !value.contact) {
      ctx.addIssue({
        code: "custom",
        path: ["contact"],
        message:
          "Add an email, or tick the anonymous box if you would rather not.",
      });
    }
  });

export type IssueSubmissionInput = z.input<typeof issueSubmissionSchema>;
export type IssueSubmissionParsed = z.output<typeof issueSubmissionSchema>;

/** Flatten zod issues into `{ field: message }` for the form to render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}
