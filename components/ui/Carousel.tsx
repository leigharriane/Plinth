"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Children,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { Container } from "@/components/ui/Container";
import { Roll } from "@/components/ui/Roll";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";

type CarouselProps = {
  /** `<li>` slides. */
  children: ReactNode;
  /** Accessible name for the list and the buttons, e.g. "Projects". */
  label: string;
  /**
   * The row above the list, usually the section heading. From md up the arrows move to
   * the end of this row, which saves their own row on short laptop screens; phones keep
   * them under the slides, within thumb reach.
   */
  header?: ReactNode;
  className?: string;
  /** Extra classes for the `<ul>`, e.g. "reveal-items" to stagger the slides in. */
  listClassName?: string;
};

/**
 * Horizontal scroll-snap list with previous/next buttons. Slides stay in the tab order,
 * so keyboard users can also reach every card's links directly; the buttons report
 * aria-disabled rather than disabled so focus isn't lost when they reach an end.
 */
export function Carousel({
  children,
  label,
  header,
  className,
  listClassName,
}: CarouselProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // Assume the slides overflow until they're measured, so the server renders the arrows.
  // Works sits below the fold, so dropping them after hydration doesn't move anything on screen.
  const [overflows, setOverflows] = useState(true);
  const slideCount = Children.count(children);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      setCanPrev(list.scrollLeft > 1);
      setCanNext(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
      // The end padding that lines the last slide up with the container makes the list
      // scrollable even when every slide is already on screen (four cards at 1920). So ask
      // whether the slides themselves run past the viewport, ignoring that padding.
      const first = list.firstElementChild;
      const last = list.lastElementChild;
      const slidesWidth =
        first && last
          ? last.getBoundingClientRect().right -
            first.getBoundingClientRect().left
          : 0;
      const inset = parseFloat(getComputedStyle(list).paddingLeft) || 0;
      const fits = inset + slidesWidth <= list.clientWidth + 1;
      // The arrows are about to go, so an arrow with focus would drop it to the body. Hand
      // it to the first slide's link, so it stays in the carousel.
      const focused = document.activeElement;
      if (fits && focused?.getAttribute("aria-controls") === list.id) {
        list.querySelector<HTMLElement>("a[href], button")?.focus();
      }
      setOverflows(!fits);
      if (fits && list.scrollLeft) list.scrollTo({ left: 0 });
    };
    // ResizeObserver also fires once on observe, which sets the initial state. It only
    // sees the list's own size, so the effect also re-runs when slides are added or removed.
    // The border box, because past the container width the inset padding soaks up every
    // change and the content box stays the same.
    const observer = new ResizeObserver(update);
    observer.observe(list, { box: "border-box" });
    list.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", update);
    };
  }, [slideCount]);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tabbing scrolls only the focused link into view, which can leave most of its card
  // clipped by the list or tucked under the sticky header. Bring the whole slide in.
  // Keyboard focus only: moving a card under a pointer mid-click could swallow the click.
  const onFocus = (event: FocusEvent<HTMLUListElement>) => {
    if (!event.target.matches(":focus-visible")) return;
    const slide = Array.from(event.currentTarget.children).find((child) =>
      child.contains(event.target),
    );
    slide?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const slide = list.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    list.scrollBy({
      left: direction * (slide ? slide.offsetWidth + gap : list.clientWidth),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  const hasHeader = Boolean(header);
  const arrows = (
    <Arrows
      label={label}
      listId={listId}
      canPrev={canPrev}
      canNext={canNext}
      onScroll={scroll}
    />
  );

  // No arrows when every slide is already on screen, e.g. four projects at 1920. With a
  // header they render in both spots and CSS shows one, so each spot keeps a tab order
  // that follows the layout: arrows before the slides from md up, after them on phones.
  return (
    <div className={className}>
      {hasHeader && (
        // min-h-12 holds the row at the arrows' height, so it doesn't shrink when they drop.
        <Container className="flex items-center justify-between gap-4 md:min-h-12">
          <div className="min-w-0 flex-1">{header}</div>
          {overflows && <div className="hidden gap-4 md:flex">{arrows}</div>}
        </Container>
      )}

      <ul
        ref={listRef}
        id={listId}
        // `list-style: none` makes WebKit drop list semantics, so VoiceOver wouldn't
        // announce the slide count without an explicit role.
        role="list"
        aria-label={label}
        onFocus={onFocus}
        className={cn(
          // Line the first slide up with the page container, then bleed to the viewport edge.
          "[--inset:max(var(--spacing-gutter),calc((100%-var(--container-page))/2+var(--spacing-gutter)))]",
          // `safe` centers the slides when they all fit and falls back to the start edge
          // once they overflow, so none become unreachable to the left.
          "flex snap-x snap-mandatory scroll-px-(--inset) justify-center-safe gap-6 px-(--inset)",
          // When everything fits, a trackpad swipe could still slide the first card off the
          // container line into that end padding, so the list stops scrolling at all.
          overflows ? "overflow-x-auto" : "overflow-x-hidden",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          hasHeader && "mt-carousel",
          listClassName,
        )}
      >
        {children}
      </ul>

      {overflows && (
        <Container
          className={cn(
            "mt-controls flex justify-end gap-4",
            hasHeader && "md:hidden",
          )}
        >
          {arrows}
        </Container>
      )}
    </div>
  );
}

type ArrowsProps = {
  label: string;
  listId: string;
  canPrev: boolean;
  canNext: boolean;
  onScroll: (direction: 1 | -1) => void;
};

function Arrows({ label, listId, canPrev, canNext, onScroll }: ArrowsProps) {
  const buttons = [
    { direction: -1, enabled: canPrev, name: "Previous", Icon: ArrowLeft },
    { direction: 1, enabled: canNext, name: "Next", Icon: ArrowRight },
  ] as const;

  return buttons.map(({ direction, enabled, name, Icon }) => (
    <button
      key={name}
      type="button"
      aria-label={`${name} ${label.toLowerCase()}`}
      aria-controls={listId}
      aria-disabled={!enabled}
      onClick={() => enabled && onScroll(direction)}
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full inset-ring-2 inset-ring-fg transition-[background-color,opacity] hover:bg-fg/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent",
        // Only an arrow that can scroll rolls.
        enabled && "group",
      )}
    >
      <Roll>
        <Icon aria-hidden className={iconSize.control} />
      </Roll>
    </button>
  ));
}
