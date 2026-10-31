"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type ComponentProps } from "react";
import { suppressTransitions } from "@/lib/theme";

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  // When following the OS, next-themes repaints as soon as it switches. This keeps that
  // change a snap too, like the toggle's.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", suppressTransitions);
    return () => query.removeEventListener("change", suppressTransitions);
  }, []);

  return <NextThemesProvider {...props} />;
}
