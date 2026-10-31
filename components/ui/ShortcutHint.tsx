import { Command } from "lucide-react";

const key = "rounded-md bg-surface px-1.5 py-0.5 font-sans text-fg";

/**
 * "Press ⌘K or Ctrl K to jump anywhere", pointing at the command palette. The shortcut
 * needs a keyboard, so it hides on small and touch screens.
 */
export function ShortcutHint({ lead = "Press" }: { lead?: string }) {
  return (
    <p className="hidden flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-meta font-medium text-fg-muted md:inline-flex pointer-coarse:hidden">
      <Command aria-hidden className="size-4" />
      {lead} <kbd className={key}>⌘K</kbd>
      or <kbd className={key}>Ctrl K</kbd>
      to jump anywhere
    </p>
  );
}
