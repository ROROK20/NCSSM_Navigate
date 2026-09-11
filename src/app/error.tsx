"use client";

import { useEffect } from "react";
import { Button, ButtonLink, Eyebrow } from "@/components/ui";
import { site } from "@/content/site";

/**
 * Route-level error boundary.
 *
 * The message shown is deliberately generic. `error.digest` is the server-side
 * correlation id, and it is the only detail worth surfacing: raw error text can
 * carry internals that should not reach a browser.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6">
      <Eyebrow>Something broke</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        This page did not load
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
        The problem is on our side, not yours. Try again, and if it keeps
        happening tell Student Government at{" "}
        <a
          href={`mailto:${site.contact.email}`}
          className="text-ink underline underline-offset-2"
        >
          {site.contact.email}
        </a>
        .
      </p>

      {error.digest ? (
        <p className="tnum mt-4 text-xs text-faint">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to the homepage
        </ButtonLink>
      </div>
    </div>
  );
}
