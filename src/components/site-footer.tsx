import Link from "next/link";
import { nav, site } from "@/content/site";
import { isDemo } from "@/content/stage";
import { ExternalLink } from "./ui";
import { Mark } from "./mark";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-semibold tracking-tight text-ink">
            <Mark className="size-[20px]" />
            {site.name}
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {isDemo
              ? "A student proposal for "
              : "A student-government project for "}
            {site.campus}. Not an official school system, and not a substitute
            for contacting staff directly.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="label text-faint">Navigate</p>
          <ul className="mt-3 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label text-faint">Help</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <ExternalLink href={site.schoolUrl}>ncssm.edu</ExternalLink>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="underline decoration-line-strong underline-offset-[3px] transition-colors hover:text-ink hover:decoration-accent"
              >
                {site.contact.email}
              </a>
            </li>
            <li className="pt-1 text-[13px] leading-relaxed text-faint">
              In an emergency call {site.crisis.emergency}. For mental health
              support any time, call or text {site.crisis.lifeline}.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Built by students, for students. Links point to official NCSSM
            systems; Navigate never stores your coursework or login.
          </p>
          <Link href="/admin" className="transition-colors hover:text-muted">
            Editor sign-in
          </Link>
        </div>
      </div>
    </footer>
  );
}
