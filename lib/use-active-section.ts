import { useEffect, useState } from "react";
import { sectionIds } from "@/lib/nav";

/**
 * The id of the section crossing a line 30% down the viewport, or null when none is,
 * e.g. over the Skills marquee between two tracked sections. `root: document` measures
 * against this page's own viewport, which also holds when it's shown inside an iframe.
 */
export function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Usually one at a time, but a set keeps exits from clearing the wrong section.
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        setActive([...crossing].at(-1) ?? null);
      },
      { root: document, rootMargin: "-30% 0px -69% 0px" },
    );
    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}
