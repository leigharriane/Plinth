"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";
import { suppressTransitions, toggledTheme } from "@/lib/theme";
import { useMounted } from "@/lib/use-mounted";

export function ThemeToggle() {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useMounted();
  // The icons only spin once the button's been clicked, never on page load.
  const [played, setPlayed] = useState(false);
  const isDark = resolvedTheme === "dark";

  // Icons swap with CSS (.theme-spin in globals.css) so the right one shows before
  // hydration; the pressed state is only announced once the theme is known on the client.
  return (
    <button
      type="button"
      aria-label="Dark mode"
      aria-pressed={mounted ? isDark : undefined}
      data-played={played || undefined}
      onClick={() => {
        setPlayed(true);
        suppressTransitions();
        setTheme(toggledTheme(resolvedTheme, systemTheme));
      }}
      className="theme-spin inline-grid size-11 place-items-center rounded-full transition-colors hover:bg-fg/10"
    >
      <Moon aria-hidden className={cn(iconSize.control, "theme-moon")} />
      <Sun aria-hidden className={cn(iconSize.control, "theme-sun")} />
    </button>
  );
}
