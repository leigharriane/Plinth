"use client";

import { useEffect } from "react";

/**
 * Plays the section entrance (see globals.css) on every [data-reveal] section on the
 * page, once each. Sections already on screen at load are left alone, so nothing above
 * the fold blinks, and without JavaScript every section just shows. Renders nothing.
 * Leaving the page shows anything still hidden, because the footer's CTA stays mounted
 * across navigations.
 */
export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    // The same line as the rootMargin: a section only peeking into the bottom 10% (its
    // top padding, usually) still plays when you scroll to it.
    const fold = window.innerHeight * 0.9;
    const hidden: HTMLElement[] = [];
    for (const section of document.querySelectorAll<HTMLElement>(
      "[data-reveal]",
    )) {
      const { top, bottom } = section.getBoundingClientRect();
      if (top < fold && bottom > 0) continue;
      section.dataset.reveal = "hidden";
      hidden.push(section);
      observer.observe(section);
    }
    return () => {
      observer.disconnect();
      for (const section of hidden) {
        if (section.dataset.reveal === "hidden") section.dataset.reveal = "";
      }
    };
  }, []);

  return null;
}
