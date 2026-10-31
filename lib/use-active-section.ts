import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { onEveryPage, sectionIds } from "@/lib/nav";

// One observer for the whole page, shared by every component that asks (the desktop
// links, the phone menu and the palette), and started for the first of them.
let active: string | null = null;
let observer: IntersectionObserver | null = null;
let footerObserver: IntersectionObserver | null = null;
let observedPath: string | null = null;
const listeners = new Set<() => void>();

function setActive(next: string | null) {
  if (next === active) return;
  active = next;
  for (const listener of listeners) listener();
}

function stop() {
  observer?.disconnect();
  observer = null;
  footerObserver?.disconnect();
  footerObserver = null;
  observedPath = null;
  setActive(null);
}

function start(pathname: string) {
  // Usually one at a time, but a set keeps exits from clearing the wrong section.
  const crossing = new Set<string>();
  // A footer section ends the page, so it may never scroll up to the line. It counts
  // once it's all in view instead, and wins over whatever the line is crossing.
  const footerInView = new Set<string>();
  const update = () =>
    setActive([...footerInView].at(-1) ?? [...crossing].at(-1) ?? null);

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) crossing.add(entry.target.id);
        else crossing.delete(entry.target.id);
      }
      update();
    },
    { root: document, rootMargin: "-30% 0px -69% 0px" },
  );
  footerObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= 0.98) footerInView.add(entry.target.id);
        else footerInView.delete(entry.target.id);
      }
      update();
    },
    { root: document, threshold: [0, 0.98] },
  );
  observedPath = pathname;
  for (const id of sectionIds) {
    const section = document.getElementById(id);
    if (!section) continue;
    observer.observe(section);
    if (onEveryPage(id)) footerObserver.observe(section);
  }
}

function subscribe(listener: () => void, pathname: string) {
  listeners.add(listener);
  if (observedPath !== pathname) {
    stop();
    start(pathname);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/**
 * The id of the section crossing a line 30% down the viewport, or null when none is,
 * e.g. over the Skills marquee between two tracked sections. `root: document` measures
 * against this page's own viewport, which also holds when it's shown inside an iframe.
 * The nav lives in the root layout and never remounts, so it looks for the sections
 * again after each client navigation, e.g. coming back from a case study.
 */
export function useActiveSection() {
  const pathname = usePathname();
  const subscribeToPath = useCallback(
    (listener: () => void) => subscribe(listener, pathname),
    [pathname],
  );
  return useSyncExternalStore(
    subscribeToPath,
    () => active,
    () => null,
  );
}

/**
 * The aria-current value for a primary nav link: "location" for the section in view on
 * the home page, and "page" for Work on a case study. A footer section in view, like
 * Contact, takes the marker from Work there, so only one link is marked at a time.
 */
export function useNavCurrent() {
  const active = useActiveSection();
  const pathname = usePathname();

  return (href: `#${string}`) => {
    const id = href.slice(1);
    if (active === id) return "location";
    if (id === "works" && pathname.startsWith("/works/") && !active)
      return "page";
    return undefined;
  };
}
