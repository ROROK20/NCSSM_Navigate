import type { Metadata } from "next";
import { getResources } from "@/lib/content";
import { ResourceDirectory } from "@/components/resource-directory";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Searchable directory of NCSSM-Durham resources: academic support, counseling, residential life, dining, transportation, technology, forms, and student life.",
};

// Editors change verification status from /admin, and that should show up on
// the next request rather than the next deploy.
export const dynamic = "force-dynamic";

export default async function ResourcesPage(props: PageProps<"/resources">) {
  const [resources, params] = await Promise.all([
    getResources(),
    props.searchParams,
  ]);
  const initialQuery = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      {/*
        Title, one line, then the search.

        This header used to run an eyebrow, a title, two paragraphs and a
        full-width tinted callout before anything you could type into: about
        440px of preamble on a page whose entire promise is finding something in
        ten seconds. The caveats still exist, in a line under the filters, where
        they are readable without being the loudest thing here.
      */}
      <header className="pt-10 pb-5 sm:pt-14">
        <p className="label text-faint">Directory</p>
        <h1 className="display mt-3 text-ink">Resources</h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted">
          Searchable by what you are trying to do, not by which system owns it.
        </p>
      </header>

      <ResourceDirectory resources={resources} initialQuery={initialQuery} />
    </div>
  );
}
