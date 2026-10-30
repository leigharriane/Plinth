"use client";

import { Pause, Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";

type Tone = "accent" | "plain";

const tones: Record<Tone, { band: string; fade: string; button: string }> = {
  accent: {
    band: "bg-accent text-on-accent",
    fade: "before:from-accent",
    // The default ring color is the accent in light mode, which would vanish on this band.
    button: "hover:bg-accent-hover focus-visible:outline-on-accent",
  },
  plain: {
    band: "bg-bg text-fg",
    fade: "before:from-bg",
    button: "hover:bg-surface",
  },
};

type MarqueeProps = {
  items: string[];
  /** Names the list and the pause button for assistive tech, e.g. "Skills". */
  label: string;
  tone?: Tone;
  reverse?: boolean;
  /** Typography and padding for the band. */
  className?: string;
};

/**
 * Endlessly scrolling text. Screen readers get the items once as a list; the moving
 * copy is hidden from them. It pauses on hover, with the button (WCAG 2.2.2), and is
 * replaced by a static, wrapping list when the visitor prefers reduced motion.
 */
export function Marquee({
  items,
  label,
  tone = "plain",
  reverse = false,
  className,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;

  const text = `${items.join(" - ")} - `;
  // Repeat short lists so each half of the track stays wider than the viewport. At
  // ~0.45em per character, 200 characters of the smaller marquee size cover ~4000px.
  const repeats = Math.max(1, Math.ceil(200 / text.length));
  const half = Array.from({ length: repeats }, () => text).join("");
  // Constant speed whatever the length; the keyframes live in globals.css.
  const style: CSSProperties = { animationDuration: `${half.length * 0.25}s` };

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        tones[tone].band,
        className,
      )}
    >
      {/* With reduced motion the track is hidden and this list wraps in its place, so
          every item stays visible. */}
      <ul
        aria-label={label}
        className="sr-only motion-reduce:not-sr-only motion-reduce:flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-[0.6em] motion-reduce:px-gutter motion-reduce:text-center"
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div
        aria-hidden
        style={style}
        className={cn(
          "flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:hidden",
          reverse && "[animation-direction:reverse]",
          paused && "[animation-play-state:paused]",
        )}
      >
        <span className="whitespace-pre">{half}</span>
        <span className="whitespace-pre">{half}</span>
      </div>

      {/* The text slides under a solid end cap so the button never sits on top of letters.
          The padding is the carousel's inset minus the button's 10px around its icon, the
          same overhang as the nav's -mr-2.5, so the pause icon lines up with the nav icons. */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center bg-inherit pr-[calc(max(var(--spacing-gutter),(100%-var(--container-page))/2+var(--spacing-gutter))-0.625rem)] pl-2 motion-reduce:hidden",
          "before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-12 before:bg-linear-to-l before:to-transparent",
          tones[tone].fade,
        )}
      >
        <button
          type="button"
          aria-label={`Pause ${label.toLowerCase()} animation`}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full transition-colors",
            tones[tone].button,
          )}
        >
          {paused ? (
            <Play aria-hidden className={iconSize.control} />
          ) : (
            <Pause aria-hidden className={iconSize.control} />
          )}
        </button>
      </div>
    </div>
  );
}
