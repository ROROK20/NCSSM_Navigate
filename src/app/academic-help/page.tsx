import type { Metadata } from "next";
import { getResources } from "@/lib/content";
import {
  academicHelpExamples,
  academicHelpGroups,
} from "@/content/academic-help";
import {
  AcademicHelpFinder,
  type HelpGroupView,
} from "@/components/academic-help-finder";

export const metadata: Metadata = {
  title: "Academic help",
  description:
    "Who can help you with a subject at NCSSM-Durham, and when: teacher office hours, peer TAs, the Writing Center, and academic advising, grouped by subject.",
};

// Reads the same merged content the directory does, so a resource hidden or
// re-pointed in /admin changes here on the next request too.
export const dynamic = "force-dynamic";

export default async function AcademicHelpPage() {
  const resources = await getResources();
  const byId = new Map(resources.map((resource) => [resource.id, resource]));

  const groups: HelpGroupView[] = academicHelpGroups
    .map((group) => ({
      id: group.id,
      label: group.label,
      blurb: group.blurb,
      routes: group.entries.flatMap((entry) => {
        const resource = byId.get(entry.resourceId);
        // Silently skipped rather than rendered as a dead row: deleting a
        // resource, or hiding one in /admin, must not break this page.
        if (!resource) return [];
        return [
          {
            id: resource.id,
            name: resource.name,
            description: resource.description,
            url: resource.officialUrl,
            external: resource.officialUrl.startsWith("http"),
            loginRequired: resource.loginRequired,
            who: entry.who,
            gives: entry.gives,
            aliases: [resource.aliases, group.aliases, entry.aliases]
              .filter(Boolean)
              .join(", "),
          },
        ];
      }),
    }))
    .filter((group) => group.routes.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pt-10 pb-5 sm:pt-14">
        <p className="label text-faint">Academic support</p>
        <h1 className="display mt-3 text-ink">Academic help</h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted">
          Who helps with the subject you are stuck in, and when they are free.
        </p>
      </header>

      <AcademicHelpFinder groups={groups} examples={[...academicHelpExamples]} />
    </div>
  );
}
