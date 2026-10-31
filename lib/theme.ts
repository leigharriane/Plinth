/**
 * The theme a dark mode toggle switches to. When that's the theme the OS already uses,
 * it goes back to following the OS instead of storing a choice, so clicking to try dark
 * mode and clicking back doesn't stop the site following the OS for good.
 */
export function toggledTheme(resolvedTheme?: string, systemTheme?: string) {
  const next = resolvedTheme === "dark" ? "light" : "dark";
  return next === systemTheme ? "system" : next;
}

let suppressing = 0;

/**
 * Turns CSS transitions off across the page until the next theme has painted, so a
 * theme change snaps instead of fading every hover-ready control at its own speed. Call
 * it right before changing the theme. Two frames: the first paints the new colors, the
 * second turns transitions back on once there's nothing left to animate.
 */
export function suppressTransitions() {
  const root = document.documentElement;
  root.classList.add("theme-changing");
  // Counted, so a quick second toggle isn't cut short by the first one's cleanup.
  suppressing++;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (--suppressing === 0) root.classList.remove("theme-changing");
    }),
  );
}
