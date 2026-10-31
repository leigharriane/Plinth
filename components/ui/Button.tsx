import { Children, type ComponentProps } from "react";
import { SectionLink } from "@/components/layout/SectionLink";
import { cn } from "@/lib/cn";
import { Roll } from "./Roll";

type Variant = "primary" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  // Figma strokes the outline button inside its bounds, so use an inset ring rather than a border.
  outline: "text-fg inset-ring inset-ring-fg hover:bg-fg/10",
};

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: Variant;
  /**
   * A home page section, e.g. "#works", in place of `href`. It goes through SectionLink, so
   * it works from any page and focuses the section on arrival.
   */
  section?: `#${string}`;
};

function Anchor({ section, ...props }: Omit<ButtonLinkProps, "variant">) {
  return section ? <SectionLink {...props} href={section} /> : <a {...props} />;
}

/** A link styled as a 48px pill button. The label and an icon after it roll on hover. */
export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Anchor
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-ui font-medium whitespace-nowrap transition-colors",
        // `[&_svg]:size-5` is `iconSize.inline`, written out so Tailwind can see the class.
        "[&_svg]:size-5 [&_svg]:shrink-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      {Children.map(children, (child) =>
        child == null || typeof child === "boolean" ? (
          child
        ) : (
          <Roll>{child}</Roll>
        ),
      )}
    </Anchor>
  );
}
