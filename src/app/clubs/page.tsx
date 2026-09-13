import { ReadinessTag } from "@/components/readiness-tag";
import type { Metadata } from "next";
import { clubs as seedClubs } from "@/content/clubs";
import { CLUB_CATEGORY_BY_ID } from "@/content/taxonomy";
import { ClubDirectory, type ClubView } from "@/components/club-directory";
import { type Tone } from "@/components/ui";

export const metadata: Metadata = {
  title: "Clubs",
  description:
    "NCSSM-Durham student clubs: what each one does, when it meets, where, and who to contact. Searchable by what a club does rather than what it is called.",
};

export default function ClubsPage() {
  const clubs: ClubView[] = seedClubs.map((club) => {
    const category = CLUB_CATEGORY_BY_ID[club.category];
    return {
      id: club.id,
      name: club.name,
      does: club.does,
      category: club.category,
      categoryLabel: category.label,
      categoryTone: category.tone as Tone,
      frequency: club.frequency,
      meets: club.meets,
      location: club.location,
      contactEmail: club.contactEmail,
      instagram: club.instagram,
      // Built from the handle rather than stored, for the same reason the
      // discount map links are: an address in a content file is an address
      // that can be mistyped, and this one cannot be.
      instagramUrl: club.instagram
        ? `https://www.instagram.com/${club.instagram}/`
        : null,
      aliases: club.aliases ?? "",
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pt-10 pb-5 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="label text-faint">Student life</p>
          <ReadinessTag href="/clubs" />
        </div>
        <h1 className="display mt-3 text-ink">Clubs</h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted">
          What each club actually does, when it meets, and who to email.
        </p>
      </header>

      <ClubDirectory clubs={clubs} />
    </div>
  );
}
