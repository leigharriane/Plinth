import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  // Figma strokes the outline button inside its bounds, so use an inset ring rather than a border.
  outline: "text-fg inset-ring inset-ring-fg hover:bg-fg/10",
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
};

/** A link styled as a 48px pill button. Put an icon after the label to get the hover nudge. */
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-ui font-medium whitespace-nowrap transition-colors",
        // `[&_svg]:size-5` is `iconSize.inline`, written out so Tailwind can see the class.
        "[&_svg]:size-5 [&_svg]:shrink-0 motion-safe:[&_svg]:transition-transform motion-safe:hover:[&_svg]:translate-x-1",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
