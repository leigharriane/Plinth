import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centers content at up to 1200px wide, with the page gutter on both sides. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-gutter", className)}
      {...props}
    />
  );
}
