"use client";

import { Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";
import { openCommandPalette } from "@/lib/command-palette";
import { visibleNavLinks } from "@/lib/nav";
import { useNavCurrent } from "@/lib/use-active-section";
import { SectionLink } from "./SectionLink";

/** Disclosure menu for the primary links below the md breakpoint. */
export function MobileMenu({ hasWorks }: { hasWorks: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = useNavCurrent();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Close on a click or on focus moving outside, e.g. tabbing past the last link,
    // so the panel never covers the focused element (WCAG 2.4.11).
    const onOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onBreakpoint = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    // The header reads this to go solid while the menu is open. See Nav.
    <div data-menu-open={open || undefined} className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-fg/10"
      >
        {open ? (
          <X aria-hidden className={iconSize.control} />
        ) : (
          <Menu aria-hidden className={iconSize.control} />
        )}
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        // The header is sticky, so page scroll can't reach a panel taller than the screen
        // (400% zoom, landscape phones). It scrolls on its own below the 64px bar instead,
        // and scroll-py-2 keeps a focused row's ring clear of the clipped edges.
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] scroll-py-2 overflow-y-auto overscroll-contain border-b border-border bg-bg"
      >
        <nav aria-label="Primary">
          <ul className="flex flex-col px-gutter py-2">
            {visibleNavLinks(hasWorks).map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  aria-current={current(link.href)}
                  onClick={() => setOpen(false)}
                  className="nav-marker flex min-h-12 items-center text-nav font-medium"
                >
                  <span data-text={link.label}>{link.label}</span>
                </SectionLink>
              </li>
            ))}
            {/* Phones have no search button in the bar, so the palette opens from here. */}
            <li className="mt-1 border-t border-border-subtle pt-1">
              {/* Pulled out into the gutter so the hover fill has room around the label,
                  while the icon stays in line with the links above. */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setOpen(false);
                  // The palette hands focus back to whatever had it on close, and this
                  // row is about to be hidden, so park focus on the menu button first.
                  buttonRef.current?.focus();
                  openCommandPalette();
                }}
                className="-mx-2 flex min-h-12 w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 text-nav font-medium transition-colors hover:bg-fg/10"
              >
                <Search
                  aria-hidden
                  className={cn(iconSize.inline, "text-fg-muted")}
                />
                Jump to…
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
