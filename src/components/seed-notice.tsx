import { Callout } from "./ui";
import { site } from "@/content/site";

/**
 * Shown wherever the directory is on screen.
 *
 * The wording matters. Every link here was found by crawling NCSSM's own sites
 * and machine-checked to confirm it resolves, so calling it "placeholder data"
 * would be wrong. What is still missing is a person confirming each row points
 * at the right page for what it claims, which is a different and weaker claim.
 * Say exactly that, and no more.
 */
export function SeedNotice({ subject = "listings" }: { subject?: string }) {
  return (
    <Callout tone="warn" title="Checked by machine, not yet by a person">
      These {subject} were collected from{" "}
      <a href={site.schoolUrl} target="_blank" rel="noopener noreferrer">
        ncssm.edu
      </a>{" "}
      and its department sites, and every link is tested automatically to
      confirm it still resolves. Nobody has yet confirmed that each one leads to
      the right page for what it says, so check anything important against the
      official source.
    </Callout>
  );
}
