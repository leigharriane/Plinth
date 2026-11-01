"use client";

import {
  ArrowRight,
  BookOpen,
  Code,
  Copy,
  FileText,
  Globe,
  Monitor,
  Moon,
  Search,
  SquareTerminal,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { CommandPaletteData, PaletteProject } from "@/lib/command-palette";
import { iconSize } from "@/lib/icons";
import { onEveryPage, pageSections } from "@/lib/nav";
import {
  complete,
  placeholderHints,
  readSecrets,
  recordSecret,
  runCommand,
  runVim,
  suggest,
  type TerminalBlock,
  type TerminalEffect,
} from "@/lib/terminal";
import { suppressTransitions, toggledTheme } from "@/lib/theme";
import { useActiveSection } from "@/lib/use-active-section";
import { focusSectionOnArrival } from "./SectionLink";

type Action = {
  id: string;
  /** What search matches on. */
  label: string;
  /** Shown in place of the label for a moment, e.g. "Copied!". Search ignores it. */
  status?: string;
  hint: string;
  /** Extra words search matches on, for actions whose label doesn't say them. */
  keywords?: string;
  icon: ReactNode;
  run: () => void;
  /** For section jumps, so the one you're reading can be marked. */
  hash?: string;
  /** For case studies, so the one you're reading can be marked. */
  path?: string;
  /** For terminal "Run" rows: the line it runs, shown in monospace. */
  command?: string;
};

/**
 * One terminal command and what it printed, for the scrollback. Lines typed in vim get
 * vim's "~" for a prompt, and its nagging has no input at all.
 */
type Exchange = {
  id: number;
  prompt: string;
  input: string | null;
  output: TerminalBlock[];
};

const projectHints: Record<PaletteProject["to"], string> = {
  "case-study": "Case study",
  live: "Live site",
  code: "Code",
  works: "Recent work",
};

/** How many exchanges the scrollback keeps. */
const scrollback = 6;
/** How long each placeholder hint stays, in ms. */
const hintInterval = 3500;

const smQuery = "(min-width: 40rem)";

function subscribeToSm(onChange: () => void) {
  const query = window.matchMedia(smQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Matches Tailwind's sm. The dialog only renders in the browser, so the server value is never used. */
function useSm() {
  return useSyncExternalStore(
    subscribeToSm,
    () => window.matchMedia(smQuery).matches,
    () => true,
  );
}

const reducedQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReduced(onChange: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the visitor asks for less motion. The server value is never used, as above. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => true,
  );
}

/** One piece of terminal output, in the scrollback's monospace. */
function Block({ block }: { block: TerminalBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p
          className={cn(
            "wrap-break-word whitespace-pre-wrap",
            block.tone === "muted" && "text-fg-muted",
          )}
        >
          {block.text}
        </p>
      );
    case "rows":
      return <Rows rows={block.rows} />;
    case "fetch":
      return (
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3 py-1">
          {/* The art is the initials again, so screen readers skip it. */}
          <pre aria-hidden className="leading-tight text-fg-muted">
            {block.art.join("\n")}
          </pre>
          <div>
            <p className="font-medium">{block.title}</p>
            <p aria-hidden className="text-fg-muted">
              {"-".repeat(block.title.length)}
            </p>
            <Rows rows={block.rows} />
          </div>
        </div>
      );
    case "art":
      return (
        <>
          {/* Read out character by character, it's noise, so screen readers get the label. */}
          <pre aria-hidden className="overflow-x-auto leading-tight">
            {block.art.join("\n")}
          </pre>
          <p className="sr-only">{block.label}</p>
        </>
      );
    case "progress":
      return <Progress label={block.label} done={block.done} />;
    case "chips":
      return (
        <ul className="flex flex-wrap gap-1.5 py-1">
          {block.items.map((item) => (
            <li key={item} className={pill.tag}>
              {item}
            </li>
          ))}
        </ul>
      );
  }
}

/** Fills ten steps in a couple of seconds, then says it's done. */
function Progress({ label, done }: { label: string; done: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 10) return;
    const id = setTimeout(() => setStep((n) => n + 1), 220);
    return () => clearTimeout(id);
  }, [step]);
  // Only the end is announced; the bar would be read out at every step. The keys make
  // the done line a new node, which live regions announce more reliably than a change.
  if (step >= 10) return <p key="done">{done}</p>;
  return (
    <p key="bar" aria-hidden>
      {label} [{"█".repeat(step)}
      {"░".repeat(10 - step)}] {step * 10}%
    </p>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4">
      {rows.map(([term, detail]) => (
        <div key={term} className="contents">
          <dt className="font-medium">{term}</dt>
          <dd className="text-fg-muted">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

type CommandPaletteDialogProps = {
  open: boolean;
  /** Asks the shell to close it. Every close, Escape included, ends in the dialog's close event. */
  onRequestClose: () => void;
  /** What had focus when it opened, e.g. the trigger button. Set by the shell. */
  returnFocusRef: RefObject<HTMLElement | null>;
  data: CommandPaletteData;
  /** Picks the first placeholder hint, from 0 to 1. The shell rolls it on every open. */
  hintSeed: number;
  /** Plays a terminal effect on the page. The shell owns it, so it outlasts the palette. */
  onEffect: (effect: TerminalEffect) => void;
};

/**
 * The palette itself: jump to a section or project, open the resume, copy the email,
 * switch theme, or open a social profile. It's also a small terminal: what's typed offers
 * "Run" rows for commands (see `lib/terminal.ts`), and their output builds up in a
 * scrollback under the input. Built on a native <dialog>, which gives the top layer, focus
 * containment and Escape for free. Arrow keys move through results, Enter runs one.
 * `CommandPalette` owns the open state and loads this on first need; an effect calls
 * showModal()/close(), so render never reads the ref.
 */
export function CommandPaletteDialog({
  open,
  onRequestClose,
  returnFocusRef,
  data,
  hintSeed,
  onEffect,
}: CommandPaletteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  // A section picked from the list. It can't take focus while the modal is open (the
  // page is inert), so it's focused on close instead of the trigger.
  const [pendingFocus, setPendingFocus] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"done" | "failed" | null>(null);
  // Bumped on every copy, so a second copy is announced again.
  const [copyCount, setCopyCount] = useState(0);
  // Kept between opens, like a terminal left running. `clear` wipes it.
  const [history, setHistory] = useState<Exchange[]>([]);
  // Set once a command runs, so the action list makes way for its output. Typing brings
  // matches back, and the next open starts with the full list.
  const [listHidden, setListHidden] = useState(false);
  // After `vim`: lines go to vim, and it won't close until :q. ⌘K still does, so it
  // can't trap anyone.
  const [inVim, setInVim] = useState(false);
  // Placeholder hints shown since it opened.
  const [hintTick, setHintTick] = useState(0);
  const listId = useId();
  const hintId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  // Picking "Use system theme" often changes nothing on screen, so it's announced.
  const [themeNote, setThemeNote] = useState("");
  // Tab completion changes the input without a keystroke, so it's announced too.
  const [completionNote, setCompletionNote] = useState("");
  const current = useActiveSection();
  const sm = useSm();
  const reducedMotion = useReducedMotion();
  const { terminal } = data;
  const hints = useMemo(
    () => (terminal ? placeholderHints(terminal) : []),
    [terminal],
  );
  // Reduced motion gets the first hint and keeps it.
  const hintIndex = reducedMotion
    ? 0
    : (Math.floor(hintSeed * hints.length) + hintTick) % hints.length;
  const typing = query !== "";

  // It mounts with `open` already true when ⌘K or a trigger beat the download.
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

  // The hints only cycle while they can be seen.
  useEffect(() => {
    if (!open || reducedMotion || typing || hints.length < 2) return;
    const id = setInterval(() => setHintTick((tick) => tick + 1), hintInterval);
    return () => clearInterval(id);
  }, [open, reducedMotion, typing, hints.length]);

  // New output lands at the bottom, like a terminal.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [history]);

  const actions = useMemo<Action[]>(() => {
    const icon = "size-5 shrink-0";
    const close = onRequestClose;
    // Like SectionLink: scroll in place on the home page, or anywhere for a footer
    // section, and go to the home page otherwise. The scroll follows html's
    // scroll-behavior, which is smooth unless motion is reduced.
    const goTo = (hash: string) => {
      close();
      const target =
        pathname === "/" || onEveryPage(hash)
          ? document.getElementById(hash)
          : null;
      if (target) {
        target.scrollIntoView({ block: "start" });
        target.setAttribute("tabindex", "-1");
        setPendingFocus(target);
      } else {
        focusSectionOnArrival(hash);
        router.push(hash === "home" ? "/" : `/#${hash}`);
      }
    };

    const sections = pageSections(data.hasWorks, data.hasExperience);
    const { resume, email } = data;

    return [
      ...sections.map(({ label, hash }) => ({
        id: `go-${hash}`,
        label,
        hint: "Jump to",
        hash,
        icon: <ArrowRight aria-hidden className={icon} />,
        run: () => goTo(hash),
      })),
      ...data.projects.map((project) => ({
        id: project.id,
        label: project.title,
        hint: projectHints[project.to],
        keywords: project.keywords,
        path: project.to === "case-study" ? project.href : undefined,
        icon:
          project.to === "case-study" ? (
            <BookOpen aria-hidden className={icon} />
          ) : project.to === "live" ? (
            <Globe aria-hidden className={icon} />
          ) : project.to === "code" ? (
            <Code aria-hidden className={icon} />
          ) : (
            <ArrowRight aria-hidden className={icon} />
          ),
        run: () => {
          if (project.to === "works") return goTo("works");
          close();
          if (project.to === "case-study") router.push(project.href);
          else window.open(project.href, "_blank", "noopener");
        },
      })),
      ...(resume
        ? [
            {
              id: "resume",
              label: "Resume",
              hint: "Open",
              icon: <FileText aria-hidden className={icon} />,
              run: () => {
                close();
                if (resume === "/resume") router.push("/resume");
                else window.open(resume, "_blank", "noopener");
              },
            },
          ]
        : []),
      {
        id: "copy-email",
        label: "Copy email",
        status:
          copied === "done"
            ? "Copied!"
            : copied === "failed"
              ? "Couldn't copy"
              : undefined,
        // The address is the hint, so the action's name stays short and readable on phones.
        hint: email,
        icon: <Copy aria-hidden className={icon} />,
        run: () => {
          const settle = (result: "done" | "failed") => {
            setCopied(result);
            setCopyCount((n) => n + 1);
          };
          // There's no clipboard on plain http, and the browser can refuse the write.
          if (!navigator.clipboard) return settle("failed");
          navigator.clipboard.writeText(email).then(
            () => settle("done"),
            () => settle("failed"),
          );
        },
      },
      {
        id: "theme",
        label: "Toggle dark mode",
        hint: "Action",
        keywords: "theme light dark appearance",
        icon: (
          <>
            <Moon aria-hidden className={cn(icon, "dark:hidden")} />
            <Sun aria-hidden className={cn(icon, "hidden dark:block")} />
          </>
        ),
        run: () => {
          suppressTransitions();
          setTheme(toggledTheme(resolvedTheme, systemTheme));
        },
      },
      {
        id: "theme-system",
        label: "Use system theme",
        // "On" is part of the option's name, so the state is announced too. This only
        // renders in the browser, so the stored theme is already known.
        hint: theme === "system" ? "On" : "Action",
        keywords: "theme light dark appearance os auto",
        icon: <Monitor aria-hidden className={icon} />,
        run: () => {
          suppressTransitions();
          setTheme("system");
          // The no-break space makes picking it again re-announce, like "Copied!".
          setThemeNote((note) =>
            note === "Following your system theme"
              ? "Following your system theme "
              : "Following your system theme",
          );
        },
      },
      ...data.socials.map((social) => ({
        id: social.id,
        label: social.label,
        hint: "Open",
        icon: social.icon,
        run: () => {
          close();
          window.open(social.url, "_blank", "noopener");
        },
      })),
    ];
  }, [
    copied,
    data,
    onRequestClose,
    pathname,
    resolvedTheme,
    router,
    setTheme,
    systemTheme,
    theme,
  ]);

  // One more than the last, so ids stay unique after old ones scroll off.
  const print = (input: string | null, output: TerminalBlock[]) => {
    const prompt = inVim ? "~" : (terminal?.prompt ?? "");
    setHistory((exchanges) =>
      [
        ...exchanges,
        { id: (exchanges.at(-1)?.id ?? -1) + 1, prompt, input, output },
      ].slice(-scrollback),
    );
  };

  /**
   * For Escape and the backdrop: closes, unless vim is open, which only answers to :q.
   * Focus goes back to the input then, since a backdrop click takes it to the dialog.
   */
  const requestClose = () => {
    if (inVim) {
      print(null, [{ type: "text", text: "Type :q to leave.", tone: "muted" }]);
      inputRef.current?.focus();
    } else {
      onRequestClose();
    }
  };

  /** Runs a line in the terminal and carries out whatever it asks for. */
  const execute = (line: string) => {
    if (!terminal) return;
    const result = inVim
      ? runVim(line)
      : runCommand(line, {
          data: terminal,
          theme: resolvedTheme,
          followsSystem: theme === "system",
          systemTheme,
          secrets: readSecrets(),
          reducedMotion,
          now: new Date(),
        });
    if (result.secret) recordSecret(result.secret);
    if (result.theme) {
      suppressTransitions();
      setTheme(result.theme);
    }
    if (result.vim !== undefined) setInVim(result.vim);
    setQuery("");
    setActive(0);
    if (result.clear) {
      setHistory([]);
      setListHidden(false);
    } else if (!result.close) {
      print(line, result.output);
    }
    if (result.copy) {
      const address = result.copy;
      // After the command's own lines, so the note lands under them.
      const failed = () =>
        print(null, [
          {
            type: "text",
            text: `Couldn't copy it. It's ${address}.`,
            tone: "muted",
          },
        ]);
      // As with "Copy email": no clipboard on plain http, and the write can be refused.
      if (navigator.clipboard)
        navigator.clipboard.writeText(address).catch(failed);
      else failed();
    }

    const { go, effect } = result;
    if (effect) onEffect(effect);
    if (go && "section" in go) {
      // The jump rows already know how to get there from any page.
      actions.find((action) => action.id === `go-${go.section}`)?.run();
    } else if (go) {
      onRequestClose();
      if (go.newTab) window.open(go.href, "_blank", "noopener");
      else router.push(go.href);
    } else if (result.close || effect === "matrix" || effect === "train") {
      // The rain and the train play over the page, so the palette gets out of the way.
      onRequestClose();
    } else if (!result.clear) {
      setListHidden(true);
    }
  };

  // Not memoized: the Run rows hold `execute`, which changes every render. It's a
  // filter over a few dozen actions.
  const q = query.trim().toLowerCase();
  const runs = terminal
    ? suggest(query, terminal).map(
        ({ line, description, exact }, index): Action & { exact: boolean } => ({
          // The index, since what's typed can hold spaces, which ids can't.
          id: `run-${index}`,
          label: `Run ${line}`,
          hint: description,
          command: line,
          icon: <SquareTerminal aria-hidden className="size-5 shrink-0" />,
          run: () => execute(line),
          exact,
        }),
      )
    : [];
  const matches = actions.filter((action) =>
    `${action.label} ${action.hint} ${action.keywords ?? ""}`
      .toLowerCase()
      .includes(q),
  );
  // Partial commands go under the palette's own actions, so its real job stays first.
  // A command typed in full goes on top: "theme dark" also matches "Toggle dark mode",
  // and Enter has to do what was typed. Unless an action is named that way: "coffee
  // shop" should open the Coffee Shop project, not brew coffee.
  const named = matches.some((action) =>
    action.label.toLowerCase().startsWith(q),
  );
  const results = inVim
    ? []
    : q
      ? [
          ...runs.filter((run) => run.exact && !named),
          ...matches,
          ...runs.filter((run) => !run.exact || named),
        ]
      : listHidden
        ? []
        : actions;

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeId = results[activeIndex]
    ? `${listId}-${results[activeIndex].id}`
    : undefined;

  const copyNote =
    copied === "done"
      ? "Email copied"
      : copied === "failed"
        ? `Couldn't copy. The email is ${data.email}.`
        : "";

  // The list is capped in height, so an arrow key can select a row out of view, e.g.
  // ArrowUp wrapping to the last one. Keys only: scrolling under a resting mouse would
  // select whichever row slid beneath it.
  const move = (step: 1 | -1) => {
    const count = Math.max(results.length, 1);
    const next = (activeIndex + step + count) % count;
    setActive(next);
    const option = results[next];
    if (option) {
      document
        .getElementById(`${listId}-${option.id}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // Keys that pick a candidate in a Japanese or Chinese input method aren't ours.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const result = results[activeIndex];
      // Nothing to pick, so it goes to the terminal, which answers like zsh.
      if (result) result.run();
      else if (q) execute(query.trim());
    } else if (event.key === "Tab" && !event.shiftKey && terminal && !inVim) {
      // Only takes Tab when there's a name to finish, so it still moves focus otherwise.
      const completed = complete(query, terminal);
      if (completed) {
        event.preventDefault();
        setQuery(completed);
        setActive(0);
        // The input changes without a keystroke, so say what it became.
        setCompletionNote(`Completed to ${completed.trim()}`);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      // Escape closes the dialog natively; this keeps the shell's state in step. It stays
      // mounted between opens, so the next open starts fresh from here.
      onClose={() => {
        onRequestClose();
        (pendingFocus ?? returnFocusRef.current)?.focus({
          preventScroll: true,
        });
        setPendingFocus(null);
        setQuery("");
        setActive(0);
        setCopied(null);
        setThemeNote("");
        setCompletionNote("");
        setHintTick(0);
        setListHidden(false);
        setInVim(false);
      }}
      onCancel={(event) => {
        // Escape, which vim famously ignores. Browsers let a page hold off Escape only
        // once in a row, so a second press still closes it; that one isn't cancelable,
        // and nagging then would leave a stale line for the next open.
        if (inVim && event.cancelable) {
          event.preventDefault();
          requestClose();
        }
      }}
      onClick={(event) => {
        // The backdrop is the dialog element itself; clicks inside land on children.
        if (event.target === event.currentTarget) requestClose();
      }}
      // Phones get it at the top, so the on-screen keyboard can't cover it.
      className="mx-auto mt-4 mb-auto w-[min(36rem,calc(100vw-2rem))] rounded-card bg-bg p-0 text-fg shadow-2xl backdrop:bg-fg/40 backdrop:backdrop-blur-sm md:m-auto"
    >
      <div className="flex flex-col">
        {/* The input's own outline would be clipped by the dialog's edge, so the whole row
            shows the site's focus ring instead, inset. Dark mode softens it to the border
            color, still 3.4:1 on the bg. */}
        <div className="flex items-center gap-3 rounded-t-card border-b border-border px-4 outline-ring has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2">
          <Search aria-hidden className="size-5 text-fg-muted" />
          <div className="relative flex min-w-0 flex-1">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              aria-label="Search commands"
              // The terminal's hints change every few seconds, so screen readers get one
              // that doesn't.
              aria-describedby={terminal ? hintId : undefined}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={
                terminal
                  ? undefined
                  : sm
                    ? "Jump to a section or project, copy email, switch theme…"
                    : "Search…"
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              // Only here, so Enter on the Close button closes rather than running a result.
              onKeyDown={onKeyDown}
              className="min-h-14 w-full min-w-0 bg-transparent text-body outline-none placeholder:text-fg-muted"
            />
            {/* The terminal's placeholder, drawn over the input so the hints can crossfade.
                Stacked, so the old one fades out while the new one fades in. */}
            {terminal && (
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 text-body text-fg-muted",
                  typing && "hidden",
                )}
              >
                {inVim ? (
                  <span className="absolute inset-0 flex items-center">
                    <span className="truncate">
                      Type <code className="font-mono text-[0.9em]">:q</code> to
                      leave vim
                    </span>
                  </span>
                ) : (
                  hints.map((hint, index) => (
                    <span
                      key={hint.command}
                      className={cn(
                        "absolute inset-0 flex items-center motion-safe:transition-opacity motion-safe:duration-700",
                        index === hintIndex ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <span className="truncate">
                        {(!sm && hint.short) || hint.text}{" "}
                        <code className="font-mono text-[0.9em]">
                          {hint.command}
                        </code>
                      </span>
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
          {terminal && (
            <span id={hintId} className="sr-only">
              {inVim
                ? "You're in vim. Type :q to leave."
                : "Jump to a section, or type a command like help."}
            </span>
          )}
          <kbd className="hidden rounded-md bg-surface px-1.5 py-0.5 text-meta font-medium text-fg-muted sm:block">
            Esc
          </kbd>
          {/* Touch has no Escape key, and the backdrop is a thin strip on phones. */}
          <button
            type="button"
            aria-label="Close"
            // Always closes, vim or not: on touch it's the only way out besides :q.
            onClick={onRequestClose}
            className="-mr-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-fg/10 sm:hidden"
          >
            <X aria-hidden className={iconSize.control} />
          </button>
        </div>

        {/* Always in the page, so the first output is announced too. Empty, it takes no
            room and no Tab stop. Scrollable once it fills, so it's focusable then. */}
        {terminal && (
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            tabIndex={history.length > 0 ? 0 : -1}
            className={cn(
              "overflow-y-auto font-mono text-tag font-normal outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2",
              history.length > 0 &&
                "max-h-[30dvh] space-y-3 border-b border-border px-4 py-3 md:max-h-72",
            )}
          >
            {history.map((exchange) => (
              <div key={exchange.id} className="space-y-1">
                {exchange.input !== null && (
                  <p className="wrap-break-word">
                    <span className="font-medium text-fg-muted">
                      {exchange.prompt}
                    </span>{" "}
                    {exchange.input}
                  </p>
                )}
                {exchange.output.map((block, index) => (
                  <Block key={index} block={block} />
                ))}
              </div>
            ))}
          </div>
        )}

        <ul
          id={listId}
          role="listbox"
          aria-label="Results"
          // Chrome makes a scrollable box a Tab stop; the input already drives the list.
          tabIndex={-1}
          // Shorter on phones, to leave room for the keyboard. The bottom fades, so a cut
          // off row reads as "scroll for more"; the padding under the last row is as tall
          // as the fade, so nothing stays faded once you reach the end. The scroll padding
          // does the same for a row the arrow keys bring into view.
          className={cn(
            "max-h-[45dvh] scroll-pt-2 scroll-pb-6 overflow-y-auto mask-b-from-[calc(100%-1.5rem)] p-2 pb-6 md:max-h-[60vh]",
            results.length === 0 && "hidden",
          )}
        >
          {results.map((action, index) => {
            const selected = index === activeIndex;
            const here =
              (action.hash !== undefined && action.hash === current) ||
              (action.path !== undefined && action.path === pathname);
            return (
              <li
                key={action.id}
                id={`${listId}-${action.id}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(index)}
                // Keeps focus in the input, so typing carries on after a row that
                // leaves the palette open, like a command or "Copy email".
                onMouseDown={(event) => event.preventDefault()}
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
                {/* flex-auto, not flex-1: both shrink with a long hint, so neither
                    the label nor the email disappears. */}
                <span className="flex-auto truncate">
                  {/* For sections and case studies, the nav's marker, so "you are here"
                      reads the same in both. The selected row is already accent, so it
                      only shows off it. */}
                  {action.command !== undefined ? (
                    <>
                      Run{" "}
                      <code className="font-mono text-[0.9em] font-normal">
                        {action.command}
                      </code>
                    </>
                  ) : here && !selected ? (
                    <span aria-current="location" className="nav-marker">
                      <span data-text={action.label}>{action.label}</span>
                    </span>
                  ) : (
                    (action.status ?? action.label)
                  )}
                </span>
                <span
                  className={cn(
                    "truncate text-meta",
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
        {q && !inVim && results.length === 0 && (
          <div className="px-3 pt-4 pb-8 text-center">
            <p className="text-body font-medium text-fg-muted">
              Nothing matches “{query}”.
            </p>
            {terminal && (
              <p className="mt-1 text-meta text-fg-muted">
                Enter runs it in the terminal.
              </p>
            )}
          </div>
        )}
      </div>
      {/* The list and "Copied!" only change on screen, so say them for screen readers
          too. The no-break space on alternate copies makes a repeat copy re-announce. */}
      <p aria-live="polite" className="sr-only">
        {q && !inVim
          ? results.length === 0
            ? terminal
              ? "No results. Enter runs it in the terminal."
              : "No results"
            : `${results.length} ${results.length === 1 ? "result" : "results"}`
          : ""}
      </p>
      <p aria-live="polite" className="sr-only">
        {copyNote && `${copyNote}${copyCount % 2 ? " " : ""}`}
      </p>
      <p aria-live="polite" className="sr-only">
        {themeNote}
      </p>
      <p aria-live="polite" className="sr-only">
        {completionNote}
      </p>
    </dialog>
  );
}
