import type { Metadata } from "next";
import { amenities as seedAmenities } from "@/content/amenities";
import { AMENITY_CATEGORY_BY_ID } from "@/content/taxonomy";
import { formatDate } from "@/lib/format";
import {
  AmenityDirectory,
  type AmenityView,
} from "@/components/amenity-directory";
import { type Tone } from "@/components/ui";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "Where to find a colour printer, a water refill station, a microwave, a vending machine, or a sanitary product dispenser on the NCSSM-Durham campus.",
};

export default function AmenitiesPage() {
  const amenities: AmenityView[] = seedAmenities.map((amenity) => {
    const category = AMENITY_CATEGORY_BY_ID[amenity.category];
    return {
      id: amenity.id,
      name: amenity.name,
      category: amenity.category,
      categoryLabel: category.label,
      categoryTone: category.tone as Tone,
      building: amenity.building,
      floor: amenity.floor,
      place: amenity.place,
      notes: amenity.notes,
      aliases: amenity.aliases ?? "",
      // Formatted on the server so the client never re-derives it from a
      // different clock, the same rule the opportunities board follows.
      checkedLabel: formatDate(amenity.lastChecked),
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pt-10 pb-5 sm:pt-14">
        <p className="label text-faint">On campus</p>
        <h1 className="display mt-3 text-ink">Amenities</h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted">
          The nearest colour printer, water refill station, microwave, vending
          machine, or sanitary product dispenser.
        </p>
      </header>

      <AmenityDirectory amenities={amenities} />
    </div>
  );
}
