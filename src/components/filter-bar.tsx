"use client";

import { SearchIcon } from "./ui";
import { cn } from "@/lib/cn";

/**
 * Shared search + category filter header for the two directory pages.
 *
 * Category selection is single-choice. With nine categories, multi-select adds
 * a mental model without adding much reach, and single-choice survives a narrow
 * phone screen as one horizontally scrolling row.
 */

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  options,
  active,
  onActiveChange,
  totalCount,
  children,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  active: string | null;
  onActiveChange: (value: string | null) => void;
  totalCount: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className={cn(
              "w-full rounded-[var(--radius)] border border-line bg-surface py-2.5 pr-3 pl-9",
              "text-[15px] text-ink placeholder:text-faint",
              "transition-colors hover:border-line-strong focus:border-accent",
            )}
          />
        </div>

        <div
          // The fade marks the row as scrollable. `mask-image` costs nothing
          // and needs no arrow button that would itself need a hit target.
          style={{
            maskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 3rem), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, #000 0, #000 calc(100% - 3rem), transparent 100%)",
          }}
          role="group"
          aria-label="Filter by category"
          // Negative margins let the row bleed to the screen edge on mobile so
          // it reads as scrollable rather than clipped.
          className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-0.5 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Chip
            label="All"
            count={totalCount}
            selected={active === null}
            onClick={() => onActiveChange(null)}
          />
          {options.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              count={option.count}
              selected={active === option.id}
              onClick={() =>
                onActiveChange(active === option.id ? null : option.id)
              }
            />
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}

function Chip({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={count === 0 && !selected}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors duration-150",
        selected
          ? "border-accent bg-accent text-accent-contrast"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
        count === 0 && !selected ? "opacity-40" : "",
      )}
    >
      {label}
      <span
        className={cn(
          "tnum ml-1.5",
          // Not an opacity: dimming text that already sits at the AA floor puts
          // it under. The selected chip has its own contrasting foreground.
          selected ? "text-accent-contrast" : "text-faint",
        )}
      >
        {count}
      </span>
    </button>
  );
}
