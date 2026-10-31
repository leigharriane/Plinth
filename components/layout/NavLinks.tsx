"use client";

import { visibleNavLinks } from "@/lib/nav";
import { useNavCurrent } from "@/lib/use-active-section";
import { SectionLink } from "./SectionLink";

/** The desktop links. The section you're reading keeps its marker. */
export function NavLinks({ hasWorks }: { hasWorks: boolean }) {
  const current = useNavCurrent();

  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-10">
        {visibleNavLinks(hasWorks).map((link) => (
          <li key={link.href}>
            <SectionLink
              href={link.href}
              aria-current={current(link.href)}
              className="nav-marker inline-flex min-h-11 min-w-11 items-center justify-center text-nav font-medium"
            >
              <span data-text={link.label}>{link.label}</span>
            </SectionLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
