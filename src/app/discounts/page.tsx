import { ReadinessTag } from "@/components/readiness-tag";
import type { Metadata } from "next";
import { discountSharedAliases, studentDiscounts } from "@/content/discounts";
import { DISCOUNT_CATEGORY_BY_ID } from "@/content/taxonomy";
import { mapsSearchUrl } from "@/lib/maps";
import {
  DiscountDirectory,
  type DiscountView,
} from "@/components/discount-directory";
import { Callout, type Tone } from "@/components/ui";

export const metadata: Metadata = {
  title: "Student discounts",
  description:
    "Durham businesses that give NCSSM students a discount, collected by the Student Government discounts committee. Terms are unconfirmed; ask at the counter.",
};

export default function DiscountsPage() {
  const discounts: DiscountView[] = studentDiscounts.map((discount) => {
    const category = DISCOUNT_CATEGORY_BY_ID[discount.category];
    return {
      id: discount.id,
      name: discount.name,
      kind: discount.kind,
      category: discount.category,
      categoryLabel: category.label,
      categoryTone: category.tone as Tone,
      // Built from the name rather than stored, so no URL in the content files
      // can drift out of date or be invented. `mapsQuery` only exists for a
      // name that needs disambiguating.
      mapsUrl: mapsSearchUrl(discount.mapsQuery || `${discount.name} Durham NC`),
      website: discount.website ?? "",
      terms: discount.terms,
      studentIdRequired: discount.studentIdRequired,
      aliases: [discount.aliases, discountSharedAliases]
        .filter(Boolean)
        .join(", "),
    };
  });

  const confirmed = discounts.filter((d) => d.terms.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="pt-10 pb-5 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="label text-faint">Around Durham</p>
          <ReadinessTag href="/discounts" />
        </div>
        <h1 className="display mt-3 text-ink">Student discounts</h1>
        <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-muted">
          Places near campus that give NCSSM students a discount, collected by
          the SG discounts committee. Tapping a name opens Google Maps for
          directions, hours, and phone.
        </p>
      </header>

      {/*
        This notice is the page, not decoration around it. The names are
        sourced and the deals are not, and a list that looks complete while
        being half unknown is the failure mode here.
      */}
      <div className="mb-6">
        <Callout
          tone="warn"
          title={
            confirmed === 0
              ? "Nobody has confirmed what these discounts are"
              : `${confirmed} of ${discounts.length} discounts confirmed`
          }
        >
          Student Government supplied the names. It has not yet said what each
          place offers or whether you need a student ID, so this page does not
          guess at a percentage. Ask at the counter before you order, and tell
          SG what you find so the next person does not have to. What each place
          sells was checked against the business&rsquo;s own listing.
        </Callout>
      </div>

      <DiscountDirectory discounts={discounts} />
    </div>
  );
}
