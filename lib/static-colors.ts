/**
 * Hex copies of the color tokens in app/globals.css, for the places that can't read CSS
 * variables: next/og images, the viewport theme color and canvas drawing. Keep them in
 * sync with the tokens; this is the only file outside globals.css that may hold color
 * literals.
 */
export const staticColors = {
  light: { bg: "#f4f2ff" },
  dark: { bg: "#030015", fg: "#f0f0f0", fgMuted: "#a5a5a5" },
  /** The same in both themes. */
  accent: "#0019ff",
  /**
   * The palette terminal's `matrix` rain, the same in both themes. The trail is a faint
   * black laid over each step, so older glyphs fade.
   */
  matrix: { trail: "rgb(0 0 0 / 0.08)", glyph: "#3ddc84" },
} as const;
