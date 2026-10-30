"use client";

import { ArrowRight, Copy, FileText, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { openCommandPaletteEvent } from "@/lib/command-palette";
import { navLinks } from "@/lib/nav";
import { socialPlatforms } from "@/lib/social-icons";
import { useActiveSection } from "@/lib/use-active-section";
import siteConfig from "@/site.config";

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  run: () => void;
  /** For section jumps, so the one you're reading can be marked. */
  hash?: string;
};

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
 * The ⌘K / Ctrl+K palette: jump to a section, open the resume, copy the email, switch
 * theme, or open a social profile. Built on a native <dialog>, which gives the top layer,
 * focus containment and Escape for free. Arrow keys move through results, Enter runs one.
 * `open` is state and an effect calls showModal()/close(), so render never reads the ref.
 */
export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Where focus goes back to on close: the trigger button or whatever had it before ⌘K.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // A section picked from the list. It can't take focus while the modal is open (the
  // page is inert), so it's focused on close instead of the trigger.
  const [pendingFocus, setPendingFocus] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  // Bumped on every copy, so a second copy is announced again.
  const [copyCount, setCopyCount] = useState(0);
  const listId = useId();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const current = useActiveSection();
  const shortcut = useShortcutLabel();

  const show = () => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setCopied(false);
    setOpen(true);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) setOpen(false);
        else show();
      }
    };
    // The phone menu's "Jump to…" row opens it this way.
    const onOpen = () => show();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(openCommandPaletteEvent, onOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(openCommandPaletteEvent, onOpen);
    };
  }, []);

  // A modal dialog doesn't stop the page scrolling behind it. Padding stands in for the
  // scrollbar, so the page doesn't shift sideways where scrollbars take up space.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const previous = {
      overflow: root.style.overflow,
      padding: root.style.paddingRight,
    };
    root.style.overflow = "hidden";
    root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.padding;
    };
  }, [open]);

  const actions = useMemo<Action[]>(() => {
    const icon = "size-5 shrink-0";
    const close = () => setOpen(false);
    const goTo = (hash: string) => {
      close();
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        target.setAttribute("tabindex", "-1");
        setPendingFocus(target);
      } else {
        router.push(`/#${hash}`);
      }
    };

    const sections = [
      ...navLinks.map((link) => ({
        label: link.label,
        hash: link.href.slice(1),
      })),
      ...(siteConfig.experience.length > 0
        ? [{ label: "Experience", hash: "experience" }]
        : []),
    ];

    return [
      ...sections.map(({ label, hash }) => ({
        id: `go-${hash}`,
        label,
        hint: "Jump to",
        hash,
        icon: <ArrowRight aria-hidden className={icon} />,
        run: () => goTo(hash),
      })),
      ...(siteConfig.resume
        ? [
            {
              id: "resume",
              label: "Resume",
              hint: "Open",
              icon: <FileText aria-hidden className={icon} />,
              run: () => {
                close();
                if (siteConfig.resume === "/resume") router.push("/resume");
                else window.open(siteConfig.resume!, "_blank", "noopener");
              },
            },
          ]
        : []),
      {
        id: "copy-email",
        label: copied ? "Copied!" : `Copy email (${siteConfig.email})`,
        hint: "Action",
        icon: <Copy aria-hidden className={icon} />,
        run: () => {
          navigator.clipboard?.writeText(siteConfig.email).then(() => {
            setCopied(true);
            setCopyCount((n) => n + 1);
          });
        },
      },
      {
        // The label and icon don't depend on the theme, so server and client HTML match.
        id: "theme",
        label: "Toggle dark mode",
        hint: "Action",
        icon: (
          <>
            <Moon aria-hidden className={cn(icon, "dark:hidden")} />
            <Sun aria-hidden className={cn(icon, "hidden dark:block")} />
          </>
        ),
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      ...siteConfig.socials
        .filter((social) => social.platform !== "email")
        .map((social) => {
          const { name, Icon, iconClassName } =
            socialPlatforms[social.platform];
          return {
            id: `social-${social.platform}-${social.url}`,
            label: social.label ?? name,
            hint: "Open",
            icon: <Icon aria-hidden className={iconClassName ?? icon} />,
            run: () => {
              close();
              window.open(social.url, "_blank", "noopener");
            },
          };
        }),
    ];
  }, [copied, resolvedTheme, router, setTheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((action) =>
      `${action.label} ${action.hint}`.toLowerCase().includes(q),
    );
  }, [actions, query]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeId = results[activeIndex]
    ? `${listId}-${results[activeIndex].id}`
    : undefined;

  const onKeyDown = (event: React.KeyboardEvent) => {
    const count = Math.max(results.length, 1);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + count) % count);
    } else if (event.key === "Enter") {
      event.preventDefault();
      results[activeIndex]?.run();
    }
  };

  return (
    <>
      {/* Desktop only. Phones open the palette from the menu, where a bare magnifier
          won't read as site search. */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={show}
        // Solid, not see-through: the nav has no bar, and muted text over a photo or the
        // About panel drops below 4.5:1.
        className="mr-1 hidden h-10 items-center gap-3 rounded-full bg-bg pr-2 pl-4 text-fg-muted inset-ring inset-ring-border transition-colors hover:bg-surface hover:text-fg md:inline-flex"
      >
        <Search aria-hidden className="size-4" />
        <span className="text-tag font-medium">Jump to…</span>
        {shortcut && (
          <kbd
            aria-hidden
            className="rounded-full bg-fg/8 px-2 py-0.5 font-sans text-tag font-medium text-fg"
          >
            {shortcut}
          </kbd>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Command palette"
        // Escape closes the dialog natively; this keeps React's state in step.
        onClose={() => {
          setOpen(false);
          (pendingFocus ?? returnFocusRef.current)?.focus({
            preventScroll: true,
          });
          setPendingFocus(null);
        }}
        onClick={(event) => {
          // The backdrop is the dialog element itself; clicks inside land on children.
          if (event.target === event.currentTarget) setOpen(false);
        }}
        // Phones get it at the top, so the on-screen keyboard can't cover it.
        className="mx-auto mt-4 mb-auto w-[min(36rem,calc(100vw-2rem))] rounded-card bg-bg p-0 text-fg shadow-2xl backdrop:bg-fg/40 backdrop:backdrop-blur-sm md:m-auto"
      >
        <div className="flex flex-col" onKeyDown={onKeyDown}>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden className="size-5 text-fg-muted" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-label="Search commands"
              autoComplete="off"
              placeholder="Jump to a section, copy email, switch theme…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              className="min-h-14 flex-1 bg-transparent text-body outline-none placeholder:text-fg-muted"
            />
            <kbd className="hidden rounded-md bg-surface px-1.5 py-0.5 text-meta font-medium text-fg-muted sm:block">
              Esc
            </kbd>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label="Results"
            // Shorter on phones, to leave room for the keyboard.
            className="max-h-[45dvh] overflow-y-auto p-2 md:max-h-[60vh]"
          >
            {results.map((action, index) => {
              const selected = index === activeIndex;
              const here = action.hash !== undefined && action.hash === current;
              return (
                <li
                  key={action.id}
                  id={`${listId}-${action.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(index)}
                  onClick={action.run}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-body font-medium",
                    // In dark mode accent is 2.55:1 on the dialog and the text doesn't
                    // change color, so a hairline marks the selection too.
                    selected &&
                      "bg-accent text-on-accent dark:inset-ring dark:inset-ring-fg/50",
                  )}
                >
                  {action.icon}
                  <span className="flex-1 truncate">
                    {/* The nav's marker, so "you are here" reads the same in both.
                        The selected row is already accent, so it only shows off it. */}
                    {here && !selected ? (
                      <span aria-current="location" className="nav-marker">
                        <span data-text={action.label}>{action.label}</span>
                      </span>
                    ) : (
                      action.label
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-meta",
                      selected ? "text-on-accent/80" : "text-fg-muted",
                    )}
                  >
                    {here ? "You're here" : action.hint}
                  </span>
                </li>
              );
            })}
          </ul>
          {/* Outside the listbox, which may only hold options. */}
          {results.length === 0 && (
            <p className="px-3 pt-4 pb-8 text-center text-body font-medium text-fg-muted">
              Nothing matches “{query}”.
            </p>
          )}
        </div>
        {/* The list and "Copied!" only change on screen, so say them for screen readers
            too. The no-break space on alternate copies makes a repeat copy re-announce. */}
        <p aria-live="polite" className="sr-only">
          {query.trim()
            ? results.length === 0
              ? "No results"
              : `${results.length} ${results.length === 1 ? "result" : "results"}`
            : ""}
        </p>
        <p aria-live="polite" className="sr-only">
          {copied ? `Email copied${copyCount % 2 ? "\u00a0" : ""}` : ""}
        </p>
      </dialog>
    </>
  );
}
