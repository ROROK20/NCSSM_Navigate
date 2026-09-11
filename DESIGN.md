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

OKLCH throughout. No `#000` or `#fff` anywhere. Neutrals carry a trace of the
accent hue (155) so greys read warm rather than dead.

Strategy: **Restrained.** Warm paper surface, near-black warm ink, one accent.

| Role | Light | Use |
| --- | --- | --- |
| `--paper` | `oklch(0.986 0.004 106)` | Page ground |
| `--surface` | `oklch(0.998 0.002 106)` | Inputs, raised panels |
| `--surface-sunken` | `oklch(0.962 0.006 118)` | Footer, alternate bands, skeletons |
| `--ink` | `oklch(0.235 0.014 155)` | Body and headings |
| `--ink-muted` | `oklch(0.475 0.013 155)` | Secondary prose |
| `--ink-faint` | `oklch(0.605 0.011 155)` | Metadata, labels |
| `--line` | `oklch(0.905 0.008 132)` | Default rule weight, everywhere |
| `--accent` | `oklch(0.475 0.105 158)` | Primary actions, current state, focus |

Ivy green is the accent because it reads calm and trustworthy on a form where
students report problems, and because it leaves red, amber, and blue free for
error, warning, and info without collision.

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

## Bans observed

No side-stripe borders. No gradient text. No glassmorphism. No hero-metric
template. No identical repeating card grids. No modals. No em dashes in copy.
