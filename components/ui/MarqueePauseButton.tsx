"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";

/**
 * The marquee's pause toggle, its only client code. It covers the whole band, so a click
 * or tap anywhere pauses it, and shows its icon only on hover, focus or while paused. It
 * just flips aria-pressed: the marquee pauses its track from CSS when it holds a pressed
 * button.
 */
export function MarqueePauseButton({
  label,
  className,
  capClassName,
}: {
  label: string;
  /** Focus ring color for the band. */
  className?: string;
  /** The end cap's background and fade, matching the band. */
  capClassName?: string;
}) {
  const [paused, setPaused] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Pause ${label.toLowerCase()} animation`}
      aria-pressed={paused}
      onClick={() => setPaused((value) => !value)}
      // The band clips overflow, so the ring sits inside it.
      className={cn(
        "group/pause absolute inset-0 flex cursor-pointer items-stretch justify-end focus-visible:-outline-offset-4 motion-reduce:hidden",
        className,
      )}
    >
      {/* The text slides under a solid end cap so the icon never sits on top of letters.
          The padding is the carousel's inset minus the icon box's 10px around its icon, the
          same overhang as the nav's -mr-2.5, so the icon lines up with the nav icons. */}
      <span
        className={cn(
          "relative flex items-center pr-[calc(max(var(--spacing-gutter),(100%-var(--container-page))/2+var(--spacing-gutter))-0.625rem)] pl-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible/pause:opacity-100 group-aria-pressed/pause:opacity-100",
          "before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-12 before:bg-linear-to-l before:to-transparent",
          capClassName,
        )}
      >
        <span className="inline-flex size-11 items-center justify-center">
          {paused ? (
            <Play aria-hidden className={iconSize.control} />
          ) : (
            <Pause aria-hidden className={iconSize.control} />
          )}
        </span>
      </span>
    </button>
  );
}
