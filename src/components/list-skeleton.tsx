/**
 * Placeholder rows for a directory that is still loading.
 *
 * Shaped like the real list so the page does not jump when content arrives.
 * `aria-hidden` keeps it out of the accessibility tree; the live status message
 * beside it is what screen readers announce.
 */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <p className="sr-only" role="status">
        Loading
      </p>
      <ul aria-hidden="true" className="border-t border-line">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="border-b border-line py-5">
            <div className="flex animate-pulse flex-col gap-2.5">
              <div className="h-4 w-1/3 rounded bg-sunken" />
              <div className="h-3 w-4/5 rounded bg-sunken" />
              <div className="h-3 w-2/5 rounded bg-sunken" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
