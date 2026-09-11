import type { Metadata } from "next";
import { getResources } from "@/lib/content";
import { ResourceDirectory } from "@/components/resource-directory";
import { SeedNotice } from "@/components/seed-notice";
import { Eyebrow } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Searchable directory of NCSSM-Durham resources: academic support, counseling, residential life, dining, transportation, technology, forms, and student life.",
};

// Editors change verification status from /admin, and that should show up on
// the next request rather than the next deploy.
export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="pt-10 pb-2 sm:pt-14">
        <Eyebrow>Directory</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Resources
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Everything students at {site.campus} regularly need, in one list.
          Search by what you are trying to do, not by which system it lives in.
        </p>

        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-faint">
          Links marked <span className="text-muted">NCSSM login required</span>{" "}
          send you to the school&rsquo;s own sign-in page. Navigate never asks
          for your password and never stores anything from behind those logins.
        </p>
      </header>

      <div className="mb-6">
        <SeedNotice subject="resources" />
      </div>

      <ResourceDirectory resources={resources} />
    </div>
  );
}
