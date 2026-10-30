"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";

type CarouselProps = {
  /** `<li>` slides. */
  children: ReactNode;
  /** Accessible name for the list and the buttons, e.g. "Projects". */
  label: string;
  className?: string;
};

/**
 * Horizontal scroll-snap list with previous/next buttons. Slides stay in the tab order,
 * so keyboard users can also reach every card's links directly; the buttons report
 * aria-disabled rather than disabled so focus isn't lost when they reach an end.
 */
export function Carousel({ children, label, className }: CarouselProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // Assume the list scrolls until it's measured, so the server renders the arrows. Works
  // sits below the fold, so dropping them after hydration doesn't move anything on screen.
  const [overflows, setOverflows] = useState(true);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      setCanPrev(list.scrollLeft > 1);
      setCanNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
      setOverflows(list.scrollWidth > list.clientWidth + 1);
    };
    // ResizeObserver also fires once on observe, which sets the initial state.
    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", update);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const slide = list.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollBy({
      left: direction * (slide ? slide.offsetWidth + gap : list.clientWidth),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const buttons = [
    { direction: -1, enabled: canPrev, name: "Previous", Icon: ArrowLeft },
    { direction: 1, enabled: canNext, name: "Next", Icon: ArrowRight },
  ] as const;

  return (
    <div className={className}>
      <ul
        ref={listRef}
        id={listId}
        aria-label={label}
        className={cn(
          // Line the first slide up with the page container, then bleed to the viewport edge.
          "[--inset:max(var(--spacing-gutter),calc((100%-var(--container-page))/2+var(--spacing-gutter)))]",
          "flex snap-x snap-mandatory scroll-px-(--inset) gap-6 overflow-x-auto px-(--inset)",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </ul>

      {/* No arrows when every slide already fits, e.g. three projects on a wide screen. */}
      {overflows && (
        <Container className="mt-controls flex justify-end gap-4">
          {buttons.map(({ direction, enabled, name, Icon }) => (
            <button
              key={name}
              type="button"
              aria-label={`${name} ${label.toLowerCase()}`}
              aria-controls={listId}
              aria-disabled={!enabled}
              onClick={() => enabled && scroll(direction)}
              className="inline-flex size-12 items-center justify-center rounded-full inset-ring-2 inset-ring-fg transition-[background-color,opacity] hover:bg-fg/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
            >
              <Icon aria-hidden className={iconSize.control} />
            </button>
          ))}
        </Container>
      )}
    </div>
  );
}
