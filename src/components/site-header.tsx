"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { nav, site, siteSections } from "@/content/site";
import { cn } from "@/lib/cn";
import { Mark } from "./mark";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const ids = useId();

  /*
   * The blurb is hidden from the accessible name and attached as a
   * description instead.
   *
   * Name-from-content would otherwise make every link announce as "Resources
   * Every NCSSM system, searchable by what you are trying to do", and a
   * screen-reader user listing ten links would hear ten sentences. A
   * description is still reachable, just not read as the name. Referencing an
   * aria-hidden element from aria-describedby is fine and is the point of it.
   */
  const blurbId = (menu: string, href: string) =>
    `${ids}-${menu}${href.replace(/\//g, "-")}`;

  // Close both menus whenever the route changes, otherwise one stays open over
  // the page the user just navigated to. Adjusting state during render is
  // React's own recommendation here; an effect would cause a cascading render.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (pathname !== renderedPath) {
    setRenderedPath(pathname);
    setOpen(false);
    setMoreOpen(false);
  }

  // Lock background scrolling while the sheet covers the viewport.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /*
   * The desktop "More" panel behaves the way a menu is expected to: Escape
   * closes it and hands focus back to the button that opened it, and a click
   * anywhere outside dismisses it. Without the focus return, a keyboard user
   * who presses Escape is left on <body> with nowhere to tab from.
   */
  useEffect(() => {
    if (!moreOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (moreRef.current?.contains(target)) return;
      if (moreButtonRef.current?.contains(target)) return;
      setMoreOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [moreOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  /** True when the current page lives behind "More", so the button shows it. */
  const moreHoldsCurrent = siteSections.some((section) =>
    section.items.some((item) => !item.inNav && isActive(item.href)),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-ink"
        >
          <Mark className="size-[22px]" />
          <span className="text-[15px]">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-[var(--radius)] px-3 py-1.5 text-sm transition-colors duration-150",
                    isActive(item.href)
                      ? "bg-sunken font-medium text-ink"
                      : "text-muted hover:bg-sunken hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Everything the bar has no room for, one tap from every page. */}
            <li className="relative">
              <button
                ref={moreButtonRef}
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                aria-expanded={moreOpen}
                aria-controls="more-menu"
                className={cn(
                  "flex items-center gap-1 rounded-[var(--radius)] px-3 py-1.5 text-sm transition-colors duration-150",
                  moreOpen || moreHoldsCurrent
                    ? "bg-sunken font-medium text-ink"
                    : "text-muted hover:bg-sunken hover:text-ink",
                )}
              >
                More
                <svg
                  viewBox="0 0 12 12"
                  width="10"
                  height="10"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-transform duration-150",
                    moreOpen ? "rotate-180" : "",
                  )}
                >
                  <path d="m3 4.5 3 3 3-3" />
                </svg>
              </button>

              {moreOpen ? (
                <div
                  ref={moreRef}
                  id="more-menu"
                  /* Ten destinations is taller than a short laptop window, so
                     the panel is capped and scrolls rather than running off
                     the bottom of the screen. */
                  className="lifted absolute top-full right-0 z-50 mt-2 max-h-[calc(100dvh-5rem)] w-[24rem] overflow-y-auto rounded-[var(--radius-lg)] border border-line bg-surface p-2"
                >
                  {siteSections.map((section) => (
                    <div key={section.id} className="px-1 py-1.5">
                      <p className="label px-2 pb-1.5 text-faint">
                        {section.label}
                      </p>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={
                                isActive(item.href) ? "page" : undefined
                              }
                              aria-describedby={blurbId("more", item.href)}
                              className={cn(
                                "block rounded-[var(--radius)] px-2 py-1.5 transition-colors",
                                isActive(item.href)
                                  ? "bg-sunken"
                                  : "hover:bg-sunken",
                              )}
                            >
                              <span className="block text-sm font-medium text-ink">
                                {item.label}
                              </span>
                              <span
                                id={blurbId("more", item.href)}
                                aria-hidden="true"
                                // One line here, two in the phone sheet: a
                                // menu is scanned, and wrapped blurbs push the
                                // last destinations off the screen.
                                // No `block` here: line-clamp sets its own
                                // display, and a display utility beside it
                                // wins and silently disables the clamp.
                                className="line-clamp-1 text-[13px] leading-snug text-muted"
                              >
                                {item.blurb}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          </ul>
        </nav>

        <div className="ml-3 hidden md:block">
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-[var(--radius)] text-ink transition-colors hover:bg-sunken md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            {open ? (
              <path d="m5 5 10 10M15 5 5 15" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" />
            )}
          </svg>
        </button>
      </div>

      {/*
        The sheet lists every destination, grouped. It used to carry the same
        five links as the bar, which on a phone meant half the site existed
        only on the homepage.
      */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-line bg-paper md:hidden"
        >
          <div className="mx-auto max-w-6xl px-2 py-2">
            {siteSections.map((section) => (
              <div key={section.id} className="py-1.5">
                <p className="label px-3 pb-1 text-faint">{section.label}</p>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        aria-describedby={blurbId("sheet", item.href)}
                        className={cn(
                          "block rounded-[var(--radius)] px-3 py-2 transition-colors",
                          isActive(item.href)
                            ? "bg-sunken"
                            : "hover:bg-sunken",
                        )}
                      >
                        <span className="block text-[15px] font-medium text-ink">
                          {item.label}
                        </span>
                        <span
                          id={blurbId("sheet", item.href)}
                          aria-hidden="true"
                          className="block text-[13px] leading-snug text-muted"
                        >
                          {item.blurb}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-sm text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
