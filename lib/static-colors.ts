/**
 * Hex copies of the color tokens in app/globals.css, for the places that can't read CSS
 * variables: next/og images and the viewport theme color. Keep them in sync with the
 * tokens; this is the only file outside globals.css that may hold color literals.
 */
export const staticColors = {
  light: { bg: "#f4f2ff" },
  dark: { bg: "#030015", fg: "#f0f0f0" },
  /** The same in both themes. */
  accent: "#0019ff",
} as const;
