import type { Release } from "./changelog";
import type { TerminalCommand } from "./config";
import { plinth } from "./plinth";

/**
 * The palette's terminal mode: the commands, what they print and the placeholder hints.
 * No React and no DOM in here, so the palette only renders the output and carries out
 * the side effects it asks for. `lib/terminal-data.ts` gathers what it needs on the server.
 */

/** A project as `ls works` and `open` see it. */
export type TerminalProject = {
  /** What you type, e.g. "habit-tracker-app". The case study slug when there is one. */
  name: string;
  title: string;
  category: string;
  year?: string;
  /** Where `open` goes: the case study, else the live site, else the code. */
  href: string | null;
  kind: "case study" | "live site" | "code" | null;
};

/** What the terminal needs from the config and the build, picked out on the server. */
export type TerminalData = {
  name: string;
  role: string;
  intro: string;
  email: string;
  location?: string;
  /** A checked IANA name like "Asia/Manila", from `lib/time-zone.ts`, for `date`. */
  timezone?: string;
  /** One line for `status`, e.g. "Open to new roles". No `status` without it. */
  status?: string;
  /** The about paragraphs, for `cat about`. */
  about: string[];
  /** For `stack`. */
  stack: string[];
  /** Same as `resume` in the config: "/resume", a file or URL, or null. */
  resume: string | null;
  /** The home page's sections in page order, for `ls` and `cd`. */
  sections: { label: string; hash: string }[];
  projects: TerminalProject[];
  /** The newest releases from CHANGELOG.md, for `whatsnew`. */
  releases: Release[];
  /** Shown before each command, e.g. "david@plinth ~ $". */
  prompt: string;
  /** Lines for `joke` and `fortune`. */
  jokes: string[];
  /** The installed Next.js version, for `neofetch`. */
  nextVersion: string;
  /** Plinth's own version, for `neofetch` and `plinth`. */
  plinthVersion: string;
  /** The day the site went live, as an ISO date, e.g. "2026-10-30". */
  launchedAt?: string;
  /** Built-ins turned off in the config. */
  disabled: string[];
  /** The config's own commands. */
  custom: TerminalCommand[];
};

/** What a command knows about the moment it runs. */
export type TerminalContext = {
  data: TerminalData;
  /** The theme on screen, "light" or "dark". */
  theme?: string;
  /** True when the theme follows the OS. */
  followsSystem: boolean;
  /** The OS theme, "light" or "dark". */
  systemTheme?: string;
  /** Ids of the easter eggs already found, from `readSecrets()`. */
  secrets: string[];
  /** True when the visitor asks for less motion, so effects print a note instead. */
  reducedMotion: boolean;
  now: Date;
};

/** One piece of output. A few shapes on purpose, like the case study blocks. */
export type TerminalBlock =
  | { type: "text"; text: string; tone?: "muted" }
  /** Two columns: a command or label, then what it is. */
  | { type: "rows"; rows: [string, string][] }
  /** ASCII art beside rows of facts, for `neofetch`. */
  | { type: "fetch"; title: string; art: string[]; rows: [string, string][] }
  /** A row of pills, for `stack`. */
  | { type: "chips"; items: string[] }
  /** ASCII art, kept on its lines. `label` is what screen readers get instead. */
  | { type: "art"; art: string[]; label: string }
  /** A progress bar that fills, then shows `done`, for `coffee`. */
  | { type: "progress"; label: string; done: string };

/** What running a line gives back. The palette prints `output` and does the rest. */
export type TerminalResult = {
  output: TerminalBlock[];
  /** Text to put on the clipboard. */
  copy?: string;
  /** Wipes the scrollback instead of adding to it. */
  clear?: boolean;
  /** Closes the palette. */
  close?: boolean;
  /** The easter egg this counts as, for `secrets`. */
  secret?: string;
  /** Somewhere to go. The palette closes on the way. */
  go?: { section: string } | { href: string; newTab: boolean };
  /** A theme to switch to. */
  theme?: Theme;
  /** Something to play on the page. Matrix and train close the palette to be seen. */
  effect?: TerminalEffect;
  /** Enters vim (true) or leaves it (false). */
  vim?: boolean;
};

type Theme = "light" | "dark" | "system";

export type TerminalEffect = "wobble" | "matrix" | "train";

/** The note an effect prints in place of moving, when motion is reduced. */
const stillNote = "It stays still, since your system asks for less motion.";

type Command = {
  name: string;
  /** Other names that run the same thing, e.g. "?" for help. */
  aliases?: string[];
  /** One line for `help` and the "Run" row. */
  description: string;
  /**
   * Left out of `help`, Tab and partial matches, so it has to be typed in full. For
   * easter eggs, where finding them is the point.
   */
  hidden?: boolean;
  /** The easter eggs it can count toward `secrets`. Its result says which one it was. */
  secrets?: string[];
  run: (args: string[], ctx: TerminalContext) => TerminalResult;
};

const text = (value: string, tone?: "muted"): TerminalBlock => ({
  type: "text",
  text: value,
  tone,
});

/** "David Parker" → "david", for the prompt and `sudo hire david`. */
export function firstName(name: string) {
  return name.trim().split(/\s+/)[0].toLowerCase();
}

/** Initials like the favicon's, e.g. "David Parker" → "DP". */
function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0]
  ).toUpperCase();
}

/** The "david@plinth" in "david@plinth ~ $", so `neofetch` matches a custom prompt. */
function promptHost(data: TerminalData) {
  return data.prompt.match(/^\S+@\S+/)?.[0] ?? `${firstName(data.name)}@plinth`;
}

/** The prompt when the config doesn't set one, e.g. "david@plinth ~ $". */
export function defaultPrompt(name: string) {
  return `${firstName(name)}@plinth ~ $`;
}

/** Lines for `joke` until the config has its own list. */
export const defaultJokes = [
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks, can I join you?",
  "I'd tell you a UDP joke, but you might not get it.",
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "It works on my machine. Great, then we'll ship your machine.",
  "The two hardest things in computing: cache invalidation, naming things, and off by one errors.",
  "!false. It's funny because it's true.",
  "Asked to buy a loaf of bread, and a dozen if they have eggs, the programmer came home with 12 loaves.",
];

/** Whole days since a date, counted from the visitor's midnight that day. */
function daysSince(isoDate: string, now: Date) {
  // A bare "2026-10-30" parses as UTC, which is the day before or after for many.
  const days = Math.floor(
    (now.getTime() - new Date(`${isoDate}T00:00`).getTime()) / 86_400_000,
  );
  return `${Math.max(days, 0)} ${days === 1 ? "day" : "days"}`;
}

/** A pedestal with the initials on it. Seven columns, so it fits beside the facts. */
function plinthArt(name: string) {
  const mark = initials(name).padEnd(2, " ");
  return [
    "  ┌─────┐  ",
    `  │ ${mark}  │  `,
    "  │     │  ",
    "┌─┴─────┴─┐",
    "└─────────┘",
  ];
}

/** "~/works/" or "./About" → "works", so paths read the way people type them. */
function clean(arg = "") {
  return arg
    .toLowerCase()
    .replace(/^[~./]+|\/+$/g, "")
    .trim();
}

/**
 * Where an href opens. Pages on this site open in place; files (like a PDF resume) and
 * other sites open in a new tab, as they do everywhere else on the site.
 */
function link(href: string) {
  return { href, newTab: !href.startsWith("/") || /\.\w+$/.test(href) };
}

/** Is every letter of `query` in `name`, in order? So "hta" finds "habit-tracker-app". */
function inOrder(query: string, name: string) {
  let i = 0;
  for (const char of name) if (char === query[i]) i++;
  return i === query.length;
}

/** The project `open` means: an exact name, then a name or title containing it, then letters in order. */
function findProject(projects: TerminalProject[], query: string) {
  const score = (project: TerminalProject) => {
    const title = project.title.toLowerCase();
    if (project.name === query || title === query) return 3;
    if (project.name.includes(query) || title.includes(query)) return 2;
    return inOrder(query.replace(/\s+/g, ""), project.name) ? 1 : 0;
  };
  let best: TerminalProject | undefined;
  let bestScore = 0;
  for (const project of projects) {
    const points = score(project);
    if (points > bestScore) [best, bestScore] = [project, points];
  }
  return best;
}

/** Minutes a timezone is ahead of UTC at a moment, e.g. 480 for Asia/Manila. */
function utcOffset(timeZone: string, at: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
      .formatToParts(at)
      .map((part) => [part.type, Number(part.value)]),
  );
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  // Compared to the start of the minute, since the formatted time has no seconds.
  return (asUtc - Math.floor(at.getTime() / 60_000) * 60_000) / 60_000;
}

/** "3 hours ahead of you", "Same time as you". Half-hour zones come out as 5.5. */
function comparedToVisitor(timeZone: string, now: Date) {
  const minutes = utcOffset(timeZone, now) + now.getTimezoneOffset();
  if (minutes === 0) return "Same time as you.";
  const hours = Math.round((Math.abs(minutes) / 60) * 100) / 100;
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes > 0 ? "ahead of" : "behind"} you.`;
}

const clock = (now: Date, timeZone?: string) =>
  new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(now);

/** A cow saying `message`, wrapped to fit the palette. */
function cow(message: string) {
  const width = 28;
  const lines: string[] = [];
  let line = "";
  for (const word of message.split(/\s+/)) {
    // Words longer than the bubble are cut up, so it never overflows.
    for (const piece of word.match(new RegExp(`.{1,${width}}`, "g")) ?? []) {
      if (line && line.length + piece.length + 1 > width) {
        lines.push(line);
        line = piece;
      } else {
        line = line ? `${line} ${piece}` : piece;
      }
    }
  }
  lines.push(line);
  const longest = Math.max(...lines.map((l) => l.length));
  const pad = (l: string) => l.padEnd(longest, " ");
  const bubble =
    lines.length === 1
      ? [`< ${pad(lines[0])} >`]
      : lines.map((l, i) => {
          const [left, right] =
            i === 0
              ? ["/", "\\"]
              : i === lines.length - 1
                ? ["\\", "/"]
                : ["|", "|"];
          return `${left} ${pad(l)} ${right}`;
        });
  return [
    ` ${"_".repeat(longest + 2)}`,
    ...bubble,
    ` ${"-".repeat(longest + 2)}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ];
}

/** What vim answers while it's open. Only a quit gets you back to the shell. */
export function runVim(input: string): TerminalResult {
  const line = input.trim();
  if (/^:(q|q!|wq|wq!|x|qa|qa!)$/.test(line)) {
    return { output: [text("Back in the shell.", "muted")], vim: false };
  }
  if (line === ":w") return { output: [text("E32: No file name")] };
  if (line.startsWith(":")) {
    return { output: [text(`E492: Not an editor command: ${line.slice(1)}`)] };
  }
  return { output: [text("Type :q to leave.", "muted")] };
}

let lastJoke = -1;

const builtins: Command[] = [
  {
    name: "help",
    aliases: ["?"],
    description: "List the commands",
    run: (_args, { data }) => ({
      output: [
        {
          type: "rows",
          rows: commandsFor(data)
            .filter((command) => !command.hidden)
            .map((command) => [
              [command.name, ...(command.aliases ?? [])].join(", "),
              command.description,
            ]),
        },
        text("Not every command is on this list.", "muted"),
      ],
    }),
  },
  {
    name: "whoami",
    description: "Who runs this site",
    run: (_args, { data }) => ({
      output: [
        text([data.name, data.role, data.location].filter(Boolean).join("\n")),
        text(data.intro, "muted"),
      ],
    }),
  },
  {
    name: "ls",
    description: "List sections, or ls works for projects",
    run: (args, { data }) => {
      // Flags change nothing here, so "ls -la" lists like "ls".
      const dir = clean(args.find((arg) => !arg.startsWith("-")));
      if (!dir) {
        const names = [
          ...data.sections.map((section) => `${section.hash}/`),
          ...(data.resume ? ["resume"] : []),
        ];
        return { output: [text(names.join("  "))] };
      }
      if (dir === "works" || dir === "projects") {
        if (data.projects.length === 0)
          return { output: [text("No projects yet.", "muted")] };
        return {
          output: [
            {
              type: "rows",
              rows: data.projects.map((project) => [
                project.name,
                [
                  [project.category, project.year].filter(Boolean).join(", "),
                  project.kind === "case study" ? "case study" : "",
                ]
                  .filter(Boolean)
                  .join(" | "),
              ]),
            },
            text(
              `Open one with open ${data.projects[0].name.split("-")[0]}.`,
              "muted",
            ),
          ],
        };
      }
      if (data.sections.some((section) => section.hash === dir)) {
        return {
          output: [text(`Nothing to list. cd ${dir} jumps there.`, "muted")],
        };
      }
      return {
        output: [text(`ls: cannot access '${dir}': No such file or directory`)],
      };
    },
  },
  {
    name: "cd",
    description: "Jump to a section",
    run: (args, { data }) => {
      const dir = clean(args[0]);
      if (!dir || dir === "home" || args[0] === "~" || args[0] === "..") {
        return { output: [], go: { section: "home" } };
      }
      // "cd work" is close enough.
      const section = data.sections.find(
        (section) =>
          section.hash === dir ||
          (dir.length >= 2 && section.hash.startsWith(dir)),
      );
      if (section) return { output: [], go: { section: section.hash } };
      if (dir === "resume" && data.resume) {
        return { output: [], go: link(data.resume) };
      }
      return { output: [text(`cd: no such file or directory: ${args[0]}`)] };
    },
  },
  {
    name: "open",
    description: "Open a project by name",
    run: (args, { data }) => {
      const query = args.join(" ").toLowerCase();
      if (!query) {
        return {
          output: [
            text("open: which one?"),
            text("ls works lists them.", "muted"),
          ],
        };
      }
      const project = findProject(data.projects, query);
      if (!project) {
        return {
          output: [
            text(`open: nothing matches '${args.join(" ")}'`),
            text("ls works lists them.", "muted"),
          ],
        };
      }
      if (!project.href) {
        return { output: [text(`${project.title} has no link yet.`)] };
      }
      return {
        output: [text(`Opened ${project.title}.`, "muted")],
        go: link(project.href),
      };
    },
  },
  {
    name: "cat",
    description: "cat about or cat resume",
    run: (args, { data }) => {
      const file = clean(args[0]);
      if (file === "about") {
        return { output: data.about.map((paragraph) => text(paragraph)) };
      }
      if (file === "resume" && data.resume) {
        return {
          output: [text("Opened the resume.", "muted")],
          go: link(data.resume),
        };
      }
      if (!file) {
        return {
          output: [
            text("cat: which file?"),
            text("Try cat about or cat resume.", "muted"),
          ],
        };
      }
      return { output: [text(`cat: ${args[0]}: No such file or directory`)] };
    },
  },
  {
    name: "email",
    description: "Copy the email address",
    run: (_args, { data }) => ({
      output: [text(`${data.email} is on your clipboard.`)],
      copy: data.email,
    }),
  },
  {
    name: "status",
    description: "Availability",
    // Only offered when the config sets one, so the fallback never shows.
    run: (_args, { data }) => ({ output: [text(data.status ?? "")] }),
  },
  {
    name: "stack",
    description: "The tech stack",
    run: (_args, { data }) => ({
      output: [
        data.stack.length > 0
          ? { type: "chips", items: data.stack }
          : text("No stack listed.", "muted"),
      ],
    }),
  },
  {
    name: "theme",
    description: "theme dark, light or system",
    run: (args, { theme, followsSystem, systemTheme }) => {
      const choice = args[0]?.toLowerCase();
      if (!choice) {
        return {
          output: [
            text(
              `${theme ?? "light"}${followsSystem ? " (from your system)" : ""}`,
            ),
            text("Try theme dark, theme light or theme system.", "muted"),
          ],
        };
      }
      if (choice === "light" || choice === "dark" || choice === "system") {
        const already =
          choice === "system"
            ? followsSystem
            : !followsSystem && choice === theme;
        if (already) {
          return {
            output: [
              text(
                choice === "system"
                  ? "Already following your system theme."
                  : `Already ${choice}.`,
              ),
            ],
          };
        }
        return {
          output: [
            text(
              choice === "system"
                ? `Following your system theme, ${systemTheme ?? "light"} right now.`
                : `Switched to ${choice}.`,
            ),
          ],
          theme: choice,
        };
      }
      return {
        output: [
          text(`theme: no theme called '${args[0]}'`),
          text("Try dark, light or system.", "muted"),
        ],
      };
    },
  },
  {
    name: "date",
    description: "Local time where I am",
    run: (_args, { data, now }) => {
      // With no timezone set, it answers like date on your own machine.
      if (!data.timezone) return { output: [text(clock(now))] };
      return {
        output: [
          text(clock(now, data.timezone)),
          text(
            [
              data.location ? `In ${data.location}.` : "",
              comparedToVisitor(data.timezone, now),
            ]
              .filter(Boolean)
              .join(" "),
            "muted",
          ),
        ],
      };
    },
  },
  {
    name: "whatsnew",
    description: "Latest changes to the site",
    run: (_args, { data }) => {
      if (data.releases.length === 0) {
        return { output: [text("No releases yet.", "muted")] };
      }
      return {
        output: data.releases.flatMap((release) => [
          text([release.version, release.date].filter(Boolean).join("  ")),
          text(
            release.changes.length > 0
              ? release.changes.map((change) => `  ${change}`).join("\n")
              : "  Small fixes.",
            "muted",
          ),
        ]),
      };
    },
  },
  {
    name: "neofetch",
    description: "Facts about this site",
    run: (_args, { data, theme, followsSystem, now }) => ({
      output: [
        {
          type: "fetch",
          title: promptHost(data),
          art: plinthArt(data.name),
          rows: [
            ["Framework", `Next.js ${data.nextVersion}`],
            ["Built with", `Plinth ${data.plinthVersion}`],
            [
              "Theme",
              `${theme ?? "light"}${followsSystem ? " (from your system)" : ""}`,
            ],
            ...(data.launchedAt
              ? [
                  ["Uptime", daysSince(data.launchedAt, now)] as [
                    string,
                    string,
                  ],
                ]
              : []),
          ],
        },
      ],
    }),
  },
  {
    name: "plinth",
    description: "What this site is built with",
    run: (args, { data }) => {
      if (["source", "repo", "github", "code"].includes(clean(args[0]))) {
        return { output: [], go: { href: plinth.url, newTab: true } };
      }
      return {
        output: [
          {
            type: "fetch",
            title: `${plinth.name} ${data.plinthVersion}`,
            art: plinthArt(plinth.name),
            rows: [
              ["By", plinth.author],
              ["Source", plinth.url],
            ],
          },
          text(plinth.tagline, "muted"),
          text("Type plinth source to open the repo.", "muted"),
        ],
      };
    },
  },
  {
    name: "joke",
    aliases: ["fortune"],
    description: "A random one liner",
    secrets: ["joke"],
    run: (_args, { data }) => {
      const { jokes } = data;
      if (jokes.length === 0) return { output: [text("No jokes today.")] };
      // Never the same one twice in a row, so a second try always pays off.
      let pick = Math.floor(Math.random() * jokes.length);
      if (jokes.length > 1 && pick === lastJoke)
        pick = (pick + 1) % jokes.length;
      lastJoke = pick;
      return { output: [text(jokes[pick])], secret: "joke" };
    },
  },
  {
    name: "sudo",
    description: "Ask nicely",
    hidden: true,
    secrets: ["sudo-hire", "sudoers"],
    run: (args, { data }) => {
      const owner = firstName(data.name);
      const [verb, who] = args.map((arg) => arg.toLowerCase());
      if (verb === "hire" && (who === owner || who === "me")) {
        return {
          output: [
            text("Permission granted."),
            text(`${data.email} is on your clipboard.`, "muted"),
          ],
          copy: data.email,
          secret: "sudo-hire",
        };
      }
      return {
        output: [
          text(
            `${owner} is not in the sudoers file. This incident will be reported.`,
          ),
        ],
        secret: "sudoers",
      };
    },
  },
  {
    name: "rm",
    description: "Remove files",
    hidden: true,
    secrets: ["rm"],
    run: (args, { reducedMotion }) => {
      const flags = args.filter((arg) => arg.startsWith("-")).join("");
      const targets = args.filter((arg) => !arg.startsWith("-"));
      if (targets.length === 0)
        return { output: [text("rm: missing operand")] };
      const everything = targets.some((target) =>
        ["/", "/*", "~", "~/", "*", "."].includes(target),
      );
      if (everything && flags.includes("r")) {
        return {
          output: [
            text("nice try."),
            ...(reducedMotion ? [text(stillNote, "muted")] : []),
          ],
          effect: reducedMotion ? undefined : "wobble",
          secret: "rm",
        };
      }
      return { output: [text(`rm: ${targets[0]}: Permission denied`)] };
    },
  },
  {
    name: "matrix",
    description: "Green rain",
    hidden: true,
    secrets: ["matrix"],
    run: (_args, { reducedMotion }) =>
      reducedMotion
        ? {
            output: [text("The rain stays off."), text(stillNote, "muted")],
            secret: "matrix",
          }
        : {
            output: [text("Entering the matrix. Esc to leave.")],
            effect: "matrix",
            secret: "matrix",
          },
  },
  {
    name: "coffee",
    description: "Brew one",
    hidden: true,
    secrets: ["coffee"],
    run: (_args, { reducedMotion }) => ({
      output: [
        reducedMotion
          ? text("Coffee's ready. ☕")
          : { type: "progress", label: "Brewing", done: "Coffee's ready. ☕" },
      ],
      secret: "coffee",
    }),
  },
  {
    name: "vim",
    aliases: ["vi", "nvim"],
    description: "Edit a file, in theory",
    hidden: true,
    secrets: ["vim"],
    run: () => ({
      output: [text("You're in vim now. Type :q to leave.")],
      vim: true,
      secret: "vim",
    }),
  },
  {
    name: "ping",
    description: "Check the connection",
    hidden: true,
    secrets: ["ping"],
    run: () => ({
      output: [text(`pong (${(8 + Math.random() * 30).toFixed(1)} ms)`)],
      secret: "ping",
    }),
  },
  {
    name: "cowsay",
    description: "Have the cow say it",
    hidden: true,
    secrets: ["cowsay"],
    run: (args) => {
      const message = args.join(" ") || "moo";
      return {
        output: [
          { type: "art", art: cow(message), label: `A cow says: ${message}` },
        ],
        secret: "cowsay",
      };
    },
  },
  {
    name: "sl",
    description: "A typo of ls",
    hidden: true,
    secrets: ["sl"],
    run: (_args, { reducedMotion }) => ({
      output: [
        text("sl: did you mean ls?"),
        text(reducedMotion ? stillNote : "Choo choo.", "muted"),
      ],
      effect: reducedMotion ? undefined : "train",
      secret: "sl",
    }),
  },
  {
    name: "secrets",
    description: "How many easter eggs you've found",
    run: (_args, { data, secrets }) => {
      // Only the eggs this site has, so turning one off doesn't make "all" unreachable.
      // A Set, since a custom command that runs a built-in brings its eggs along.
      const ids = [
        ...new Set(
          commandsFor(data).flatMap((command) => command.secrets ?? []),
        ),
      ];
      const found = ids.filter((id) => secrets.includes(id)).length;
      const total = ids.length;
      return {
        output: [
          text(
            found === total
              ? `You've found all ${total}. Nice.`
              : `You've found ${found} of ${total}.`,
          ),
          ...(found < total ? [text("Keep typing.", "muted")] : []),
        ],
      };
    },
  },
  {
    name: "clear",
    description: "Clear the output",
    run: () => ({ output: [], clear: true }),
  },
  {
    name: "exit",
    aliases: [":q"],
    description: "Close the palette",
    run: () => ({ output: [], close: true }),
  },
];

/** Every built-in's name, for checking the config's `run` and `disable` at build. */
export const builtinNames = builtins.map((command) => command.name);

/** Names the shell itself needs, so the config can't take them. */
export const reservedNames = ["help", "?", "clear", "exit", ":q"];

/** A command from the config, as the registry runs it. */
function fromConfig(custom: TerminalCommand): Command {
  const base = {
    name: custom.name.trim().toLowerCase(),
    description: custom.description,
    hidden: custom.hidden,
  };
  if ("print" in custom) {
    return { ...base, run: () => ({ output: [text(custom.print)] }) };
  }
  if ("href" in custom) {
    const { href } = custom;
    return {
      ...base,
      run: () => ({
        output: [text(`Opened ${href}.`, "muted")],
        go: href.startsWith("#") ? { section: href.slice(1) } : link(href),
      }),
    };
  }
  const builtin = builtins.find((command) => command.name === custom.run);
  return {
    ...base,
    secrets: builtin?.secrets,
    run: (args, ctx) =>
      builtin
        ? builtin.run(args, ctx)
        : { output: [text(`${base.name}: nothing to run`)] },
  };
}

const registries = new WeakMap<TerminalData, Command[]>();

/**
 * The commands this site has: the built-ins it didn't turn off, then its own, with
 * `clear` and `exit` last. One of its own replaces a built-in with the same name.
 */
function commandsFor(data: TerminalData) {
  const cached = registries.get(data);
  if (cached) return cached;
  const custom = data.custom.map(fromConfig);
  const keep = (command: Command) =>
    !data.disabled.includes(command.name) &&
    !custom.some(
      (own) => own.name === command.name || command.aliases?.includes(own.name),
    ) &&
    // Nothing to say without a status line.
    (command.name !== "status" || Boolean(data.status));
  const plumbing = ["clear", "exit"];
  const list = [
    ...builtins.filter((c) => keep(c) && !plumbing.includes(c.name)),
    ...custom,
    ...builtins.filter((c) => plumbing.includes(c.name)),
  ];
  registries.set(data, list);
  return list;
}

function find(name: string, data: TerminalData) {
  const key = name.toLowerCase();
  return commandsFor(data).find(
    (command) => command.name === key || command.aliases?.includes(key),
  );
}

/** Splits a line into the command name and its arguments. */
function parse(input: string) {
  const [name = "", ...args] = input.trim().split(/\s+/);
  return { name, args };
}

/**
 * The commands to offer as "Run" rows for what's typed. A known command offers itself
 * with its arguments, marked `exact`. A partial word of two letters or more offers every
 * listed command it starts, so "who" offers `whoami`. Hidden ones only match in full.
 */
export function suggest(input: string, data: TerminalData) {
  const { name, args } = parse(input);
  if (!name) return [];
  const exact = find(name, data);
  if (exact) {
    return [
      { line: input.trim(), description: exact.description, exact: true },
    ];
  }
  if (args.length > 0 || name.length < 2) return [];
  const key = name.toLowerCase();
  return commandsFor(data)
    .filter((command) => !command.hidden && command.name.startsWith(key))
    .map((command) => ({
      line: command.name,
      description: command.description,
      exact: false,
    }));
}

/**
 * What Tab turns the input into: the rest of a command name when only one listed command
 * starts with what's typed, or as much as they share when several do. Null when there's
 * nothing to add, so Tab can move focus as usual.
 */
export function complete(input: string, data: TerminalData) {
  if (/\s/.test(input.trim()) || !input.trim()) return null;
  const key = input.trim().toLowerCase();
  const names = commandsFor(data)
    .filter((command) => !command.hidden)
    .map((command) => command.name)
    .filter((name) => name.startsWith(key));
  if (names.length === 0) return null;
  let shared = names[0];
  for (const name of names) {
    while (!name.startsWith(shared)) shared = shared.slice(0, -1);
  }
  if (names.length === 1) shared += " ";
  return shared.length > input.length ? shared : null;
}

/** Runs one line. Unknown input answers the way zsh would. */
export function runCommand(
  input: string,
  ctx: TerminalContext,
): TerminalResult {
  const { name, args } = parse(input);
  const command = find(name, ctx.data);
  if (!command) {
    return {
      output: [
        text(`zsh: command not found: ${name}`),
        text("Type help to see what's here.", "muted"),
      ],
    };
  }
  return command.run(args, ctx);
}

/**
 * The placeholder hints, cycled while the input is empty. The first is the default, and
 * the only one shown when motion is reduced. Only commands the site has are hinted.
 */
export function placeholderHints(
  data: TerminalData,
): { text: string; short?: string; command: string }[] {
  const has = (line: string) => find(line.split(" ")[0], data) !== undefined;
  const intro = { text: "Jump to a section, or try", short: "Search, or try" };
  const first = has("whoami") ? "whoami" : "help";
  return [
    { ...intro, command: first },
    { text: "try", command: `sudo hire ${firstName(data.name)}` },
    { text: "try", command: "neofetch" },
    { text: "try", command: "plinth" },
    { text: "try", command: "joke" },
    { text: "try", command: "help" },
  ].filter(
    (hint, index) =>
      index === 0 || (has(hint.command) && hint.command !== first),
  );
}

const secretsKey = "plinth-terminal-secrets";

/** The easter eggs found in this browser. Storage can be blocked, so it fails quietly. */
export function readSecrets(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(secretsKey) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/** Counts an easter egg as found. Once each, so a repeat changes nothing. */
export function recordSecret(id: string) {
  const found = readSecrets();
  if (found.includes(id)) return;
  try {
    localStorage.setItem(secretsKey, JSON.stringify([...found, id]));
  } catch {
    // Private mode or blocked storage. The egg still worked; it just isn't counted.
  }
}
