import { Callout } from "./ui";
import { site } from "@/content/site";

/**
 * Shown wherever seed data is on screen.
 *
 * This exists so nobody mistakes placeholder content for confirmed content.
 * Delete this component's usages once the directory has been reviewed and the
 * rows are marked verified in /admin.
 */
export function SeedNotice({ subject = "listings" }: { subject?: string }) {
  return (
    <Callout tone="warn" title="This is a preview build">
      The {subject} here are starter data written to demonstrate the site, not a
      list supplied by the school. Links point at{" "}
      <a href={site.schoolUrl} target="_blank" rel="noopener noreferrer">
        ncssm.edu
      </a>{" "}
      and other public sites, but no one has confirmed each one yet. Check
      anything important against the official source before relying on it.
    </Callout>
  );
}
