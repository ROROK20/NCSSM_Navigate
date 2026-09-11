import Link from "next/link";
import { nav } from "@/content/site";
import { ArrowRight, ButtonLink, Eyebrow } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 pb-28 sm:px-6">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        That page is not here
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
        The link may be old, or the page may have moved. Everything Navigate has
        is reachable from one of these.
      </p>

      <ul className="mt-8 max-w-md border-t border-line">
        {nav.map((item) => (
          <li key={item.href} className="border-b border-line">
            <Link
              href={item.href}
              className="group flex items-center justify-between py-3.5 text-[15px] text-ink transition-colors hover:text-accent"
            >
              {item.label}
              <ArrowRight className="text-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
      </div>
    </div>
  );
}
