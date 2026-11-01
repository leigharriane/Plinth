import type { ReactNode } from "react";
import type { TerminalData } from "./terminal";

/**
 * What the palette needs from `plinth.config.ts`, picked out by the server Nav so the config
 * and the brand icon set stay out of the browser bundle.
 */
export type CommandPaletteData = {
  email: string;
  /** Same as `resume` in the config: "/resume", a file or URL, or null to leave it out. */
  resume: string | null;
  /** Keeps the Works jump only when the home page has that section. */
  hasWorks: boolean;
  /** Adds an Experience jump when the home page has that section. */
  hasExperience: boolean;
  /** Profiles to open, without email, which has its own action. */
  socials: { id: string; label: string; url: string; icon: ReactNode }[];
  /** Every project, each pointing at the best place it has. Built by `paletteProjects`. */
  projects: PaletteProject[];
  /** What the terminal mode needs, from `terminalData`. Null when it's turned off. */
  terminal: TerminalData | null;
};

export type PaletteProject = {
  id: string;
  title: string;
  /**
   * Where it goes, which is also the row's hint: its case study, else its live site, else
   * its repo, else the Works section for a card with no links.
   */
  to: "case-study" | "live" | "code" | "works";
  /** A path for "case-study", a full URL for "live" and "code", "#works" for "works". */
  href: string;
  /** Category, year and tags, so "react" or "2024" finds it. */
  keywords: string;
};

/**
 * Opens the command palette from anywhere, e.g. the phone menu's "Jump to…" row. The
 * palette owns its open state, so this goes through a window event rather than props.
 */
export const openCommandPaletteEvent = "plinth:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(openCommandPaletteEvent));
}
