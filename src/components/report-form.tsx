"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ISSUE_CATEGORIES } from "@/content/taxonomy";
import { site } from "@/content/site";
import { fieldErrors, issueSubmissionSchema, MAX } from "@/lib/validation";
import { acceptsSubmissions, isDemo } from "@/content/stage";
import { addDemoSubmission } from "@/lib/demo-store";
import type { IssueCategoryId } from "@/content/taxonomy";
import { cn } from "@/lib/cn";
import { ArrowRight, Button, Callout } from "./ui";
import { EscalationNotice } from "./escalation-notice";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY = {
  title: "",
  description: "",
  category: "",
  location: "",
  contact: "",
  anonymous: false,
  consent: false,
};

export function ReportForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);

  // Stamped after mount rather than during render, because reading the clock
  // while rendering is impure. Until it is set the elapsed check trivially
  // passes, which is the safe direction: it never blocks a real submission.
  const mountedAt = useRef(0);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const ids = {
    title: useId(),
    description: useId(),
    category: useId(),
    location: useId(),
    contact: useId(),
    anonymous: useId(),
    consent: useId(),
    website: useId(),
  };

  function update<K extends keyof typeof EMPTY>(
    key: K,
    value: (typeof EMPTY)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the error for a field as soon as the student edits it; leaving it
    // red while they type is just nagging.
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);



    const payload = {
      ...values,
      // The honeypot lives in the DOM, not in React state, so a bot that fills
      // every input is caught while a real submission always sends "".
      website:
        (
          event.currentTarget.elements.namedItem("website") as HTMLInputElement | null
        )?.value ?? "",
      elapsedMs: Date.now() - mountedAt.current,
    };

    const parsed = issueSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      const next = fieldErrors(parsed.error);
      setErrors(next);
      setStatus("error");
      setFormError("Check the highlighted fields and try again.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setErrors({});
    setStatus("submitting");

    /*
     * Demo: keep every behaviour a visitor can see - validation, the pause,
     * the confirmation, the entry appearing on the status board - and drop the
     * one they cannot, which is the network request. Nothing is posted,
     * nothing is stored server-side, and no officer is notified.
     */
    if (!acceptsSubmissions) {
      addDemoSubmission({
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category as IssueCategoryId,
        location: parsed.data.location?.trim() || null,
        anonymous: parsed.data.anonymous,
      });

      // A short pause so the submitting state is visible rather than a flash.
      await new Promise((resolve) => setTimeout(resolve, 450));

      setNotified(false);
      setStatus("success");
      setValues(EMPTY);
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        if (data?.errors) setErrors(data.errors);
        setStatus("error");
        setFormError(
          data?.message ??
            "Your submission was not saved. Please email Student Government instead.",
        );
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }

      setNotified(Boolean(data.notified));
      setStatus("success");
      setValues(EMPTY);
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("error");
      setFormError(
        "Could not reach the server, so nothing was submitted. Check your connection, or email Student Government instead.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  /* ----------------------------------------------------------- success */

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-[var(--radius-lg)] border border-[color:var(--success)]/35 bg-[color:var(--success-soft)] p-6 sm:p-8"
      >
        <p className="label text-[color:var(--success)]">
          {isDemo ? "Demo submission" : "Submitted"}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
          {isDemo
            ? "That is what submitting looks like."
            : "Student Government has your submission."}
        </h2>
        <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
          {isDemo ? (
            <p className="font-medium text-ink">
              Nothing was sent. This is a demonstration, so what you wrote
              stayed in your browser — no officer was notified and no record
              was created. If you have a real issue, it still needs reporting
              somewhere that exists today.
            </p>
          ) : null}
          <p>
            {isDemo ? "In the real thing, an" : "An"} SG officer will read it
            and work out who actually owns the decision. That might be SG, or
            it might be a school office SG refers it to.
          </p>
          <p>
            SG cannot promise to resolve every issue, and you will not
            necessarily get an individual reply
            {values.anonymous ? ", especially on an anonymous submission" : ""}.
            What SG does commit to is publishing progress on the status board
            with no identifying details.
          </p>
          {notified ? (
            <p className="text-faint">SG officers have been notified.</p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            {isDemo ? "See it on the status board" : "See the status board"}
            <ArrowRight />
          </Link>
          <button
            type="button"
            onClick={() => {
              mountedAt.current = Date.now();
              setStatus("idle");
            }}
            className="text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            Submit something else
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- form */

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      {formError ? (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-[var(--radius-lg)] border border-[color:var(--danger)]/40 bg-[color:var(--danger-soft)] px-4 py-3.5 text-sm"
        >
          <p className="font-semibold text-ink">{formError}</p>
          <p className="mt-1 text-muted">
            You can always email{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="text-ink underline underline-offset-2"
            >
              {site.contact.email}
            </a>{" "}
            directly.
          </p>
        </div>
      ) : null}

      <Field
        id={ids.title}
        label="What is the issue?"
        hint="A short, plain title. Think of a headline."
        error={errors.title}
        required
      >
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={MAX.title}
            placeholder="Dryers on 3rd take payment without running"
            className={inputClass(Boolean(errors.title))}
          />
        )}
      </Field>

      <Field
        id={ids.description}
        label="What is happening?"
        hint="What you have noticed, how often, and what you have already tried. Leave out anything you would not want an SG officer to read."
        error={errors.description}
        required
        counter={`${values.description.length} / ${MAX.description}`}
      >
        {(props) => (
          <textarea
            {...props}
            rows={7}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            maxLength={MAX.description}
            className={cn(inputClass(Boolean(errors.description)), "resize-y")}
          />
        )}
      </Field>

      {/*
        Watches what is actually being written, not the category picked. Someone
        describing a threat rarely stops to classify it first.
      */}
      <EscalationNotice text={`${values.title} ${values.description}`} />

      <Field
        id={ids.category}
        label="Category"
        hint="Pick the closest one. SG re-files it if you guess wrong."
        error={errors.category}
        required
      >
        {(props) => (
          <select
            {...props}
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className={cn(inputClass(Boolean(errors.category)), "pr-8")}
          >
            <option value="">Choose a category</option>
            {ISSUE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        id={ids.location}
        label="Where on campus?"
        hint="Optional. A building, hall, or room helps SG check it."
        error={errors.location}
      >
        {(props) => (
          <input
            {...props}
            type="text"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            maxLength={MAX.location}
            placeholder="Bryan, 3rd floor laundry"
            className={inputClass(Boolean(errors.location))}
          />
        )}
      </Field>

      {/* ------------------------------------------------------- privacy */}
      <fieldset className="rounded-[var(--radius-lg)] border border-line bg-sunken p-5">
        <legend className="label px-1 text-faint">Your details</legend>

        <label
          htmlFor={ids.anonymous}
          className="flex cursor-pointer items-start gap-3"
        >
          <input
            id={ids.anonymous}
            type="checkbox"
            checked={values.anonymous}
            onChange={(e) => update("anonymous", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          />
          <span className="text-sm leading-relaxed">
            <span className="font-medium text-ink">Submit anonymously</span>
            <span className="mt-0.5 block text-muted">
              No contact details are stored at all. SG will not be able to ask
              you a follow-up question or tell you the outcome directly.
            </span>
          </span>
        </label>

        {!values.anonymous ? (
          <div className="mt-5">
            <Field
              id={ids.contact}
              label="How can SG reach you?"
              hint="Your NCSSM email is usually best. Seen only by SG officers, never published."
              error={errors.contact}
            >
              {(props) => (
                <input
                  {...props}
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={values.contact}
                  onChange={(e) => update("contact", e.target.value)}
                  maxLength={MAX.contact}
                  placeholder="you@ncssm.edu"
                  className={inputClass(Boolean(errors.contact))}
                />
              )}
            </Field>
          </div>
        ) : null}
      </fieldset>

      {/* Honeypot. Hidden from people and from assistive technology alike. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor={ids.website}>Leave this field empty</label>
        <input
          id={ids.website}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {/* ------------------------------------------------------- consent */}
      <div>
        <label
          htmlFor={ids.consent}
          className="flex cursor-pointer items-start gap-3"
        >
          <input
            id={ids.consent}
            type="checkbox"
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${ids.consent}-error` : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          />
          <span className="text-sm leading-relaxed text-muted">
            I understand that SG officers will read this, that it may be
            forwarded to the school office that handles the issue, and that a
            generalised version with no identifying details may appear on the
            public status board.
          </span>
        </label>
        {errors.consent ? (
          <p
            id={`${ids.consent}-error`}
            className="mt-2 text-sm text-[color:var(--danger)]"
          >
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Callout tone="danger" title="This form is not for emergencies">
        <p>
          Nobody monitors it around the clock. If someone is in danger, call{" "}
          {site.crisis.emergency}. For mental-health support any time, call or
          text {site.crisis.lifeline}. Durham Campus Safety is{" "}
          <a href="tel:+19194162911">919-416-2911</a>.
        </p>
        <p className="mt-2">
          NCSSM has proper routes for the serious things, staffed by people
          trained to act on them. Use a{" "}
          <a
            href="https://ncssm-advocate.symplicity.com/care_report/index.php/pid992479"
            target="_blank"
            rel="noopener noreferrer"
          >
            CARE report
          </a>{" "}
          if you are worried about a student, and{" "}
          <a
            href="https://ncssm-advocate.symplicity.com/public_report/index.php/pid750944"
            target="_blank"
            rel="noopener noreferrer"
          >
            Advocate
          </a>{" "}
          for conduct or harassment. Student Government is not a substitute for
          either.
        </p>
      </Callout>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <Spinner />
              Submitting
            </>
          ) : (
            <>
              Submit to Student Government
              <ArrowRight />
            </>
          )}
        </Button>
        <p className="text-xs text-faint">
          Submissions are never shown publicly.
        </p>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- pieces */

function inputClass(invalid: boolean) {
  return cn(
    "w-full rounded-[var(--radius)] border bg-surface px-3 py-2.5 text-[15px] text-ink",
    "placeholder:text-faint transition-colors",
    invalid
      ? "border-[color:var(--danger)]"
      : "border-line hover:border-line-strong focus:border-accent",
  );
}

/**
 * One labelled control. Wires up the label, hint, and error message to the
 * input by id so screen readers announce all three together.
 */
function Field({
  id,
  label,
  hint,
  error,
  required,
  counter,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  counter?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-1 text-[color:var(--danger)]" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="ml-2 text-xs font-normal text-faint">Optional</span>
          )}
        </label>
        {counter ? (
          <span className="tnum text-xs text-faint">{counter}</span>
        ) : null}
      </div>

      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[13px] leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">
        {children({
          id,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
          "aria-required": required || undefined,
        })}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className="animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="8" cy="8" r="6" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" strokeLinecap="round" />
    </svg>
  );
}
