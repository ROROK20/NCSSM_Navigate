"use client";

import { useActionState, useState } from "react";
import { saveUpdate, type ActionState } from "@/app/admin/actions";
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from "@/content/taxonomy";
import type { SgUpdate } from "@/content/types";
import { Button } from "@/components/ui";

const INPUT =
  "mt-1.5 w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors hover:border-line-strong focus:border-accent";

/**
 * Create or edit one public status entry.
 *
 * The warning copy is not decoration: this form is the single place where text
 * about a student submission becomes public, so the rule against reusing a
 * submission's words belongs right next to the textarea.
 */
export function UpdateEditor({ editing }: { editing?: SgUpdate }) {
  // Always starts collapsed, including for an existing entry, so the admin page
  // does not mount one full form per update. Keeping them all in the DOM was
  // both wasteful and confusing for anyone tabbing through the page.
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveUpdate,
    null,
  );

  if (!open) {
    return (
      <Button
        variant={editing ? "ghost" : "secondary"}
        onClick={() => setOpen(true)}
        className={editing ? "px-2.5 py-1 text-xs" : undefined}
      >
        {editing ? "Edit this entry" : "Post a new update"}
      </Button>
    );
  }

  return (
    <form
      action={action}
      className="rounded-[var(--radius-lg)] border border-line bg-surface p-5"
    >
      <h3 className="font-semibold text-ink">
        {editing ? "Edit update" : "New public update"}
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">
        Write this from scratch. Never paste a student&rsquo;s words, a name, an
        email, or a room number. Generalise until the entry could describe
        several reports at once.
      </p>

      {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor={`u-title-${editing?.id ?? "new"}`} className="text-sm font-medium text-ink">
            Public title
          </label>
          <input
            id={`u-title-${editing?.id ?? "new"}`}
            name="title"
            required
            defaultValue={editing?.title}
            placeholder="Laundry machines out of service in residence halls"
            className={INPUT}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`u-cat-${editing?.id ?? "new"}`} className="text-sm font-medium text-ink">
              Category
            </label>
            <select
              id={`u-cat-${editing?.id ?? "new"}`}
              name="category"
              defaultValue={editing?.category ?? ""}
              className={INPUT}
            >
              <option value="">Choose</option>
              {ISSUE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`u-status-${editing?.id ?? "new"}`} className="text-sm font-medium text-ink">
              Status
            </label>
            <select
              id={`u-status-${editing?.id ?? "new"}`}
              name="status"
              defaultValue={editing?.status ?? "received"}
              className={INPUT}
            >
              {ISSUE_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`u-sum-${editing?.id ?? "new"}`} className="text-sm font-medium text-ink">
            Public summary
          </label>
          <textarea
            id={`u-sum-${editing?.id ?? "new"}`}
            name="summary"
            rows={4}
            required
            defaultValue={editing?.summary}
            placeholder="What SG actually did, in plain language."
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor={`u-next-${editing?.id ?? "new"}`} className="text-sm font-medium text-ink">
            Next step
            <span className="ml-2 text-xs font-normal text-faint">Optional</span>
          </label>
          <input
            id={`u-next-${editing?.id ?? "new"}`}
            name="nextStep"
            defaultValue={editing?.nextStep ?? ""}
            placeholder="What happens next, and roughly when."
            className={INPUT}
          />
        </div>
      </div>

      {state ? (
        <p
          role="status"
          className={
            state.ok
              ? "mt-4 text-sm text-[color:var(--success)]"
              : "mt-4 text-sm text-[color:var(--danger)]"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving" : editing ? "Save changes" : "Publish update"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
