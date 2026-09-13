import type { StudentDiscount } from "./types";

/**
 * Durham businesses that give NCSSM students a discount.
 *
 * WHAT IS SOURCED AND WHAT IS NOT, because this list is unusual:
 *
 *  - The NAMES came from the SG discounts committee. They are the reason this
 *    page exists.
 *  - The KIND (what each place sells) was confirmed against the business's own
 *    listing. It is not committee data, and it is here because "Quickly Tea
 *    House" does not tell a hungry student it sells bubble tea.
 *  - The TERMS are not known. Nobody has said what any of these discounts is,
 *    or whether a student ID is needed. `terms` is therefore empty and
 *    `studentIdRequired` is null on every row, and the page says so.
 *
 * Do not fill `terms` in from a guess, a review site, or another school's list.
 * A student refused at a counter because this page promised ten percent is a
 * worse outcome than no listing at all. When the committee reports back, fill
 * the field and the "not confirmed" labelling disappears on its own.
 *
 * Menu items are deliberately absent from `aliases` unless the business's own
 * listing named them: nobody here has read a menu.
 *
 * Editable as a spreadsheet: `npm run content:export discounts`.
 */
export const studentDiscounts: StudentDiscount[] = [
  {
    id: "devils-ny-pizzeria",
    name: "Devils NY Pizzeria",
    kind: "New York style pizza, pasta, calzones",
    category: "pizza",
    terms: "",
    studentIdRequired: null,
    aliases:
      "pizza, slice, pizzeria, italian, ny pizza, new york pizza, calzone, pasta",
  },
  {
    id: "pincho-loco",
    name: "Pincho Loco",
    kind: "Ice cream, popsicles, ice cream cakes",
    category: "ice-cream",
    terms: "",
    studentIdRequired: null,
    aliases:
      "ice cream, popsicle, popsicles, paleta, dessert, sweet, birthday cake",
  },
  {
    id: "quickly-tea-house",
    name: "Quickly Tea House",
    kind: "Bubble tea, instant ramen, popcorn chicken",
    category: "bubble-tea",
    terms: "",
    studentIdRequired: null,
    aliases:
      "boba, bubble tea, milk tea, tea, drinks, ramen, popcorn chicken",
  },
  {
    id: "del-rancho",
    name: "Del Rancho",
    kind: "Mexican",
    category: "mexican",
    terms: "",
    studentIdRequired: null,
    aliases:
      "mexican, mexican food, mexican grill, latin",
  },
  {
    id: "toreros",
    name: "Torero's",
    kind: "Mexican and Tex-Mex, fajitas",
    category: "mexican",
    terms: "",
    studentIdRequired: null,
    aliases:
      "mexican, tex mex, tex-mex, fajitas, mexican food, downtown",
  },
  {
    id: "chicken-bee",
    name: "Chicken Bee",
    kind: "Korean fried chicken, ramen",
    category: "korean",
    terms: "",
    studentIdRequired: null,
    aliases:
      "korean, fried chicken, korean fried chicken, chicken, ramen",
  },
  {
    id: "lime-and-lemon",
    name: "Lime and Lemon",
    kind: "Indian, vegetarian and non-vegetarian",
    category: "indian",
    terms: "",
    studentIdRequired: null,
    aliases:
      "indian, indian food, vegetarian, grill",
  },
];

/**
 * Search words every row shares.
 *
 * Joined onto each row's aliases at render time rather than copied into seven
 * records, so "student discount" reaching all seven stays one edit.
 */
export const discountSharedAliases =
  "discount, student discount, deal, deals, cheap, cheap food, eat, eating out, food, restaurant, off campus, durham, student id, save money";
