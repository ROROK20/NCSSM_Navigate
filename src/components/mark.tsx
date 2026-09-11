/**
 * Navigate's mark: a compass needle pointing up-right, drawn on the same 24px
 * grid as the site's icons. Used in the header, the favicon, and the OG image.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle
        cx="12"
        cy="12"
        r="10.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.28"
      />
      <path
        d="M12 4.75 16.4 19.25 12 15.6 7.6 19.25Z"
        fill="var(--accent)"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
