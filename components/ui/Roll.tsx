import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const motion = "transition-transform duration-400 ease-ios";

/**
 * The button hover: while the nearest `group` is hovered, the content rolls up out of
 * view and a copy rolls in from below. The copy is hidden from screen readers. With
 * reduced motion nothing moves. Wrap the label and the icon separately so they roll
 * side by side.
 */
export function Roll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span
        className={cn(
          "inline-flex",
          motion,
          "motion-safe:group-hover:-translate-y-full",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 inline-flex translate-y-full",
          motion,
          "motion-safe:group-hover:translate-y-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
