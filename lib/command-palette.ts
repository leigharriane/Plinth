/**
 * Opens the command palette from anywhere, e.g. the phone menu's "Jump to…" row. The
 * palette owns its open state, so this goes through a window event rather than props.
 */
export const openCommandPaletteEvent = "plinth:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(openCommandPaletteEvent));
}
