import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------- tone */

/**
 * Category and status colours live in CSS variables, so they are applied with
 * inline `style` rather than Tailwind classes. Tailwind cannot generate a class
 * from a runtime value, and a lookup table of every tone class would drift.
 */
export type Tone =
  | "alert"
  | "one"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight";

export type StatusTone =
  | "neutral"
  | "info"
  | "active"
  | "warn"
  | "done"
  | "closed";

export const toneVar = (tone: Tone) => `var(--tone-${tone})`;
export const statusVar = (tone: StatusTone) => `var(--status-${tone})`;

/* -------------------------------------------------------------- type bits */

export function SectionHeading({
  children,
  as: As = "h2",
  className,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <As
      className={cn(
        "font-semibold tracking-tight text-ink",
        As === "h1" ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("label text-faint", className)}>{children}</p>;
}

/* ---------------------------------------------------------------- buttons */

type ButtonVariant = "primary" | "secondary" | "ghost";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] " +
  "text-sm font-medium transition-colors duration-150 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-contrast px-4 py-2.5 hover:bg-accent-hover " +
    "active:bg-accent-hover",
  secondary:
    "border border-line-strong bg-surface text-ink px-4 py-2.5 " +
    "hover:border-ink-muted hover:bg-sunken",
  ghost: "text-ink px-2.5 py-1.5 hover:bg-sunken",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  href,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  variant?: ButtonVariant;
  href: string;
}) {
  return (
    <Link
      href={href}
      {...props}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}
    >
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------- links */

/**
 * Any link leaving the site. `noopener` prevents the opened page from reaching
 * back through `window.opener`; `noreferrer` keeps the referrer header off.
 */
export function ExternalLink({
  href,
  children,
  className,
  showIcon = true,
  ...props
}: ComponentProps<"a"> & { href: string; showIcon?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-baseline gap-1 underline decoration-line-strong " +
          "underline-offset-[3px] transition-colors hover:decoration-accent hover:text-accent",
        className,
      )}
      {...props}
    >
      {children}
      {showIcon ? <ArrowUpRight className="shrink-0 translate-y-px" /> : null}
    </a>
  );
}

/* ------------------------------------------------------------------ icons */

/** Inline SVGs. Avoids an icon dependency and keeps the payload tiny. */

export function ArrowUpRight({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2.5" y="5.25" width="7" height="5" rx="1" />
      <path d="M4.25 5.25V3.75a1.75 1.75 0 0 1 3.5 0v1.5" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="15"
      height="15"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.2 10.2 3 3" />
    </svg>
  );
}

/* ---------------------------------------------------------------- callout */

type CalloutTone = "info" | "warn" | "danger" | "accent";

const CALLOUT_TONES: Record<CalloutTone, string> = {
  info: "border-line bg-sunken text-ink",
  warn: "border-[color:var(--warn)]/35 bg-[color:var(--warn-soft)] text-ink",
  danger:
    "border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] text-ink",
  accent: "border-[color:var(--accent)]/30 bg-accent-soft text-ink",
};

export function Callout({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border px-4 py-3.5 text-sm leading-relaxed",
        CALLOUT_TONES[tone],
        className,
      )}
    >
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ empty state */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="border-y border-line px-6 py-16 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      {children ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {children}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- tag */

export function CategoryTag({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-full"
        style={{ background: toneVar(tone) }}
      />
      <span className="label text-muted">{label}</span>
    </span>
  );
}

export function StatusPip({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklch, ${statusVar(tone)} 35%, transparent)`,
        background: `color-mix(in oklch, ${statusVar(tone)} 9%, transparent)`,
      }}
    >
      <span
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-full"
        style={{ background: statusVar(tone) }}
      />
      <span className="text-xs font-medium text-ink">{label}</span>
    </span>
  );
}

/** Small neutral marker: "NCSSM login required", "Unverified", counts. */
export function Chip({
  children,
  icon,
  tone = "neutral",
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "warn" | "danger";
}) {
  const tones = {
    neutral: "border-line text-faint",
    warn: "border-[color:var(--warn)]/40 text-[color:var(--warn)]",
    danger: "border-[color:var(--danger)]/40 text-[color:var(--danger)]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
