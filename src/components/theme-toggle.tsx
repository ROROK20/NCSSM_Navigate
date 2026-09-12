"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

/**
 * Light / system / dark, in the header.
 *
 * Three states rather than two. "System" is the honest default and most people
 * want it; a two-way switch forces a choice and then ignores the phone's own
 * night setting, which is the wrong behaviour for a site students open at 11pm
 * in a dorm.
 *
 * The chosen value is written to the root element by the inline script in
 * layout.tsx before first paint, so this component never causes a flash. All it
 * does after mount is keep the button in sync and write the change.
 */

type Theme = "light" | "system" | "dark";
const KEY = "navigate-theme";

/*
 * The theme is external state: it lives on the root element and in
 * localStorage, and the inline script in layout.tsx sets it before React
 * exists. Reading it through useSyncExternalStore keeps the button in sync
 * without an effect that sets state on mount.
 */
let snapshot: Theme = "system";
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* Nothing readable; "system" is the right answer. */
  }
  return "system";
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", refresh);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", refresh);
  };
}

function refresh() {
  snapshot = read();
  for (const listener of listeners) listener();
}

let loaded = false;
function getSnapshot(): Theme {
  if (!loaded) {
    snapshot = read();
    loaded = true;
  }
  return snapshot;
}

/** The server has no storage, so it always renders the un-stamped default. */
function getServerSnapshot(): Theme {
  return "system";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, theme);
  } catch {
    /* Private windows and blocked site data: the choice just will not stick. */
  }
  refresh();
}

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="8" cy="8" r="3.1" />
        <path d="M8 1.4v1.4M8 13.2v1.4M14.6 8h-1.4M2.8 8H1.4M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="1.8" y="2.8" width="12.4" height="8.4" rx="1.2" />
        <path d="M5.5 13.9h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z" />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  // "system" on the server and on the first client render, matching the
  // un-stamped document, so hydration agrees.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-line p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.label}
            onClick={() => apply(option.value)}
            className={cn(
              "inline-flex size-[26px] items-center justify-center rounded-full transition-colors duration-150",
              active
                ? "bg-accent text-accent-contrast"
                : "text-faint hover:text-ink",
            )}
          >
            <span className="sr-only">{option.label}</span>
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
