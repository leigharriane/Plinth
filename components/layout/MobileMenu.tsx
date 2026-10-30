"use client";

import { Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { iconSize } from "@/lib/icons";
import { openCommandPalette } from "@/lib/command-palette";
import { navLinks } from "@/lib/nav";
import { useActiveSection } from "@/lib/use-active-section";

/** Disclosure menu for the primary links below the md breakpoint. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection();

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
    <div className="md:hidden">
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
        className="absolute inset-x-0 top-full border-b border-border bg-bg"
      >
        <nav aria-label="Primary">
          <ul className="flex flex-col px-gutter py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={
                    active === link.href.slice(1) ? "location" : undefined
                  }
                  onClick={() => setOpen(false)}
                  className="nav-marker flex min-h-12 items-center text-nav font-medium"
                >
                  <span data-text={link.label}>{link.label}</span>
                </a>
              </li>
            ))}
            {/* Phones have no search button in the bar, so the palette opens from here. */}
            <li className="mt-1 border-t border-border-subtle pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  // The palette hands focus back to whatever had it on close, and this
                  // row is about to be hidden, so park focus on the menu button first.
                  buttonRef.current?.focus();
                  openCommandPalette();
                }}
                className="flex min-h-12 w-full items-center gap-3 text-nav font-medium text-fg-muted"
              >
                <Search aria-hidden className={iconSize.inline} />
                Jump to…
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
