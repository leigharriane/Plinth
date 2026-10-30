"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";
import { useMounted } from "@/lib/use-mounted";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  // Icons swap with CSS so the right one shows before hydration; the pressed
  // state is only announced once the theme is known on the client.
  return (
    <button
      type="button"
      aria-label="Dark mode"
      aria-pressed={mounted ? isDark : undefined}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-fg/10"
    >
      <Moon aria-hidden className={cn(iconSize.control, "dark:hidden")} />
      <Sun aria-hidden className={cn(iconSize.control, "hidden dark:block")} />
    </button>
  );
}
