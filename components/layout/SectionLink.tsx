"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentProps } from "react";
import { onEveryPage } from "@/lib/nav";

type SectionLinkProps = Omit<ComponentProps<"a">, "href"> & {
  /** A home page section, e.g. "#works". */
  href: `#${string}`;
};

// The section asked for from another page. Next scrolls to it on arrival but leaves focus
// on the body, so the next Tab would start from the top of the page instead.
let pendingSection: string | null = null;

/** Focuses a home page section once a navigation from another page lands on it. */
export function focusSectionOnArrival(id: string) {
  pendingSection = id;
}

/**
 * Links to a section of the home page from anywhere. On the home page it stays a plain
 * hash link, so the browser scrolls in place and moves the focus start point to the
 * section, and so does a footer section like "#contact" on any page. Elsewhere it goes
 * to the home page first, and "#home" goes to the top.
 */
export function SectionLink({ href, onClick, ...props }: SectionLinkProps) {
  const pathname = usePathname();

  // Every SectionLink runs this on each navigation; the first takes the pending section.
  // It runs after Next's own scroll, so focusing mustn't scroll again.
  useEffect(() => {
    if (pathname !== "/" || !pendingSection) return;
    const target = document.getElementById(pendingSection);
    pendingSection = null;
    if (!target) return;
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, [pathname]);

  if (pathname === "/" || onEveryPage(href.slice(1)))
    return <a href={href} onClick={onClick} {...props} />;
  return (
    <Link
      href={href === "#home" ? "/" : `/${href}`}
      onClick={(event) => {
        onClick?.(event);
        // A modified click opens a new tab, which this page's effect never sees.
        const newTab =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        if (!newTab) focusSectionOnArrival(href.slice(1));
      }}
      {...props}
    />
  );
}
