"use client";

import { usePathname } from "next/navigation";

/**
 * "/ Case study title" after the nav's name, on a case study page. It fades in once the
 * page's own heading has scrolled under the nav (see .nav-trail in globals.css). Hidden
 * from screen readers, since it only repeats that heading. `titles` maps each case
 * study's path to its title, picked by the server Nav so the config stays out of the browser.
 */
export function NavTrail({ titles }: { titles: Record<string, string> }) {
  const title = titles[usePathname()];
  if (!title) return null;

  return (
    <span
      aria-hidden
      className="nav-trail hidden min-w-0 items-center gap-2 text-brand font-medium text-fg-muted lg:flex"
    >
      <span>/</span>
      <span className="truncate">{title}</span>
    </span>
  );
}
