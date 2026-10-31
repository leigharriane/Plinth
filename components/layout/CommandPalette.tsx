"use client";

import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";
import {
  openCommandPaletteEvent,
  type CommandPaletteData,
} from "@/lib/command-palette";
import type { TerminalEffect } from "@/lib/terminal";

// The dialog, its actions and their icons stay off first load. Rendering it starts the
// download, which happens when the browser is idle or on first use, whichever is sooner.
const CommandPaletteDialog = dynamic(
  () =>
    import("./CommandPaletteDialog").then((mod) => mod.CommandPaletteDialog),
  { ssr: false },
);

// Only downloaded when a terminal command plays one, e.g. `matrix`.
const TerminalEffects = dynamic(
  () => import("./TerminalEffects").then((mod) => mod.TerminalEffects),
  { ssr: false },
);

const noSubscribe = () => () => {};

/** "⌘K" on Apple devices, "Ctrl K" elsewhere. Null until hydrated: the server can't know. */
function useShortcutLabel() {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => null,
  );
}

/**
 * The ⌘K / Ctrl+K palette's always-loaded part: the "Jump to…" button, the shortcut and
 * the open state. A request that lands before the dialog has downloaded stays open, so
 * the dialog shows itself as soon as it arrives. `data` comes from the server Nav, so
 * `site.config.ts` and the brand icon set never reach the browser for this.
 */
export function CommandPalette({ data }: { data: CommandPaletteData }) {
  const [open, setOpen] = useState(false);
  // Once true, the dialog is rendered (and so downloaded) for good.
  const [wanted, setWanted] = useState(false);
  // Where focus goes back to on close: the trigger button or whatever had it before ⌘K.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shortcut = useShortcutLabel();
  // Picks the first placeholder hint, fresh on every open, so a second open teaches
  // something new. A number from 0 to 1, since the hints load with the dialog.
  const [hintSeed, setHintSeed] = useState(0);
  // Lives here, not in the dialog, so the rain and the train outlast the palette.
  const [effect, setEffect] = useState<{
    kind: TerminalEffect;
    run: number;
  } | null>(null);

  const show = (trigger?: HTMLElement) => {
    returnFocusRef.current =
      trigger ?? (document.activeElement as HTMLElement | null);
    setHintSeed(Math.random());
    setWanted(true);
    setOpen(true);
  };
  const close = useCallback(() => setOpen(false), []);

  const onShortcut = useEffectEvent(() => (open ? close() : show()));
  // The phone menu's "Jump to…" row opens it this way.
  const onOpenEvent = useEffectEvent(() => show());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onShortcut();
      }
    };
    const onOpen = () => onOpenEvent();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(openCommandPaletteEvent, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(openCommandPaletteEvent, onOpen);
    };
  }, []);

  // Fetch it ahead of use, so the first ⌘K is instant. The timeout is for browsers
  // without requestIdleCallback, e.g. Safari.
  useEffect(() => {
    const load = () => setWanted(true);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(load, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(load, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* Desktop only. Phones open the palette from the menu, where a bare magnifier
          won't read as site search. */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        // Safari doesn't focus a clicked button, so it's passed in for focus to return to.
        onClick={(event) => show(event.currentTarget)}
        // Solid, not see-through: the nav has no bar, and muted text over a photo or the
        // About panel drops below 4.5:1. So the hover is the other controls' fg/10 mixed
        // into the page color rather than laid over whatever is behind.
        className="mr-1 hidden h-11 items-center gap-3 rounded-full bg-bg pr-2 pl-4 text-fg-muted inset-ring inset-ring-border transition-colors hover:bg-[color-mix(in_oklab,var(--color-fg)_10%,var(--color-bg))] hover:text-fg md:inline-flex"
      >
        <Search aria-hidden className="size-4" />
        <span className="text-tag font-medium">Jump to…</span>
        {/* Rendered from the start, hidden until hydrated, so it doesn't pop in and shift
            the nav. "⌘K" holds the space, so on a Mac nothing moves at all. */}
        <kbd
          aria-hidden
          className={cn(
            "rounded-full bg-fg/8 px-2 py-0.5 font-sans text-tag font-medium text-fg",
            !shortcut && "invisible",
          )}
        >
          {shortcut ?? "⌘K"}
        </kbd>
      </button>

      {wanted && (
        <CommandPaletteDialog
          open={open}
          onRequestClose={close}
          returnFocusRef={returnFocusRef}
          data={data}
          hintSeed={hintSeed}
          // `run` changes on every request, so the same effect can play twice in a row.
          onEffect={(kind) =>
            setEffect((previous) => ({ kind, run: (previous?.run ?? 0) + 1 }))
          }
        />
      )}
      {effect && (
        <TerminalEffects effect={effect} onDone={() => setEffect(null)} />
      )}
    </>
  );
}
