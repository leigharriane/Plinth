"use client";

import { navLinks } from "@/lib/nav";
import { useActiveSection } from "@/lib/use-active-section";

/** The desktop links. The section you're reading keeps its marker. */
export function NavLinks() {
  const active = useActiveSection();

  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-10">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              aria-current={
                active === link.href.slice(1) ? "location" : undefined
              }
              className="nav-marker inline-flex min-h-11 min-w-11 items-center justify-center text-nav font-medium"
            >
              <span data-text={link.label}>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
