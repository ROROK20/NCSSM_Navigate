# NCSSM Navigate — design system

Tokens live in `src/app/globals.css`. Components ask for semantic names
(`border-line`, `text-muted`), never raw palette values.

## Direction

**Signage and catalog, not dashboard.** The site is a wayfinding tool, so it
borrows from departure boards and library catalogs: hairline-divided lists,
index numerals, tabular figures, a monospace micro-label for metadata, and rules
instead of drop shadows.

This was a deliberate move away from two reflexes. "Campus portal" pulls toward
navy-and-white institutional; the counter-reflex pulls toward friendly purple
SaaS. Neither describes a tool students actually reach for.

## Color

OKLCH throughout. No `#000` or `#fff` anywhere. The accent is NCSSM's own blue,
`#346094`, lifted from the school site and converted to
`oklch(0.483 0.098 254)`. Neutrals carry a trace of that hue (254) so greys read
cool, like the school's heather-grey spirit wear, rather than dead.

Strategy: **Restrained.** Cool paper surface, near-black blue-cast ink, one
accent.

| Role | Light | Use |
| --- | --- | --- |
| `--paper` | `oklch(0.985 0.003 254)` | Page ground |
| `--surface` | `oklch(0.999 0.002 254)` | Inputs, raised panels |
| `--surface-sunken` | `oklch(0.958 0.008 254)` | Footer, alternate bands, skeletons |
| `--ink` | `oklch(0.230 0.022 254)` | Body and headings |
| `--ink-muted` | `oklch(0.470 0.020 254)` | Secondary prose |
| `--ink-faint` | `oklch(0.535 0.018 254)` | Metadata, labels |
| `--line` | `oklch(0.898 0.010 254)` | Default rule weight, everywhere |
| `--accent` | `oklch(0.470 0.100 254)` | Primary actions, current state, focus |

The school's blue is the accent because students already recognise it from
spirit wear and the school site, so the tool reads as theirs rather than as a
third-party product.

The risk in that choice is the "school portal" reflex: navy-and-white letterhead
with a logo lockup. The counter is execution, not hue. Cool heather-grey
grounds echo the merch rather than institutional white, the light blue is a
working surface colour rather than a decorative tint, and the signage layout
below is nothing a school portal would do.

One collision this forced: the category dot at hue 252 was indistinguishable
from the accent, so `--tone-one` moved to 212 and `--tone-four` to 186.

Every ink-on-surface pair is checked against WCAG AA (4.5:1) in both themes at
the 11-13px metadata sizes. `--ink-faint` is the binding constraint. Changing a
lightness value means re-checking the set.

Dark mode is handled entirely by redefining these variables under
`prefers-color-scheme: dark`. Components almost never carry a `dark:` class.

**Category tones** (`--tone-alert`, `--tone-one` … `--tone-eight`) and **status
tones** (`--status-*`) are applied via inline `style`, because Tailwind cannot
generate a class from a runtime value. They appear only as small dots and pips,
never as a filled card.

## Typography

One family: **Archivo** (grotesk, signage DNA) for everything. **Geist Mono**
carries one job only, the `.label` micro-label used for category names, meta
row keys, and table headers.

- Fixed rem scale, not fluid.
- `.tnum` for tabular figures on dates, counts, and IDs.
- Prose capped at 65–75ch via `max-w-2xl` / `max-w-3xl`.

## Layout

- Hairline-divided lists, not shadowed card grids. Where a grid is right, cells
  share a 1px gap over a `bg-line` parent so the block reads as one board.
- The homepage's four primary actions are one bordered block with internal
  hairlines. The first cell is accent-filled so the set is not four identical
  tiles.
- The hero is two columns: the search on the left, the most-looked-up resources
  on the right. A headline over empty space was the original layout and it read
  as unfinished; the list both fills the column and puts real destinations where
  the eye lands. The example chips under the search ("stressed", "broken dryer")
  demonstrate alias matching, which is otherwise invisible.
- Sticky elements: header at `top-0`, directory filter bars at `top-14`.
- Category chip rows bleed to the screen edge on mobile via negative margins, so
  they read as scrollable rather than clipped.

## Motion

150–200 ms, `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease`). Motion conveys state
only: hover tint, arrow nudge, focus ring, skip-link reveal. No page-load
choreography, no bounce. `prefers-reduced-motion` collapses all of it.

## Components

`src/components/ui.tsx` holds the shared vocabulary: `Button`, `ButtonLink`,
`ExternalLink`, `Callout`, `Chip`, `CategoryTag`, `StatusPip`, `EmptyState`,
`Eyebrow`, and the inline SVG icons. One button shape, one form-control
treatment, one focus style across the whole site.

Every state is covered: loading (`loading.tsx` skeletons shaped like the real
rows), empty (`EmptyState` with a clear-filters action), success (the report
form's confirmation panel), and error (`error.tsx`, inline field errors, and a
form-level alert that always offers the SG email as a fallback).

`ReadinessTag` marks what each surface actually is: **Working now**, **Needs
data**, **Examples only**, **Demo only**. It renders the same `StatusPip` the
issue tracker uses, so the colours stay inside the set already checked in both
themes, and it reads its label from one table in `src/content/readiness.ts`.
The homepage, the page itself and the list on the proposal page all render from
that table, which is the point: three places describing the same feature cannot
drift into claiming different things. A route absent from the table renders no
tag, because a page nobody has judged should not claim a status.

## Accessibility

- Skip link is the first tab stop on every page.
- One `<h1>` per page, enforced by an end-to-end test.
- One focus treatment: a 2px accent outline with a 2px offset, visible on every
  surface.
- Every form control has a `<label>`; hints and errors are wired through
  `aria-describedby`, invalid fields through `aria-invalid`.
- Result counts announce through `aria-live="polite"`.
- Decorative SVGs are `aria-hidden`; a test asserts none escape.
- No page scrolls horizontally at 360px wide; a test asserts this per route.
- Every foreground/background token pair clears WCAG AA (4.5:1) in both themes,
  including small metadata text on tinted callout backgrounds. `--ink-faint` is
  the binding constraint in light mode at 4.51:1 against sunken; do not lighten
  it without re-measuring.

## Bans observed

No side-stripe borders. No gradient text. No glassmorphism. No hero-metric
template. No identical repeating card grids. No modals. No em dashes in copy.
