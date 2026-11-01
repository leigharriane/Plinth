import nextPackage from "next/package.json";
import siteConfig from "@/plinth.config";
import { readReleases } from "./changelog";
import { pageSections } from "./nav";
import { paletteProjects } from "./palette-projects";
import {
  builtinNames,
  defaultJokes,
  defaultPrompt,
  reservedNames,
  type TerminalData,
  type TerminalProject,
} from "./terminal";
import { timeZone } from "./time-zone";

const config = siteConfig.terminal;

const kinds = {
  "case-study": "case study",
  live: "live site",
  code: "code",
  works: null,
} as const;

/** The home page's sections in page order, as `ls` and `cd` see them. */
const sections = pageSections(
  siteConfig.projects.length > 0,
  siteConfig.experience.length > 0,
);

function fail(message: string): never {
  throw new Error(`plinth.config.ts: ${message}`);
}

/**
 * Checks the `terminal` block at build, so a typo fails the build with a message saying
 * what to change, instead of a command that quietly never runs.
 */
function check() {
  if (
    config?.launched !== undefined &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(config.launched) ||
      Number.isNaN(Date.parse(config.launched)))
  ) {
    fail(
      `\`terminal.launched\` must be a date like "2026-10-30" (got "${config.launched}").`,
    );
  }
  for (const name of config?.disable ?? []) {
    if (!builtinNames.includes(name)) {
      fail(
        `\`terminal.disable\` has "${name}", which isn't a built-in command.`,
      );
    }
  }
  const seen = new Set<string>();
  for (const command of config?.commands ?? []) {
    const { name } = command;
    if (!/^[a-z][a-z0-9_-]*$/.test(name)) {
      fail(
        `terminal command names are one lowercase word, like "blog" (got "${name}").`,
      );
    }
    if (reservedNames.includes(name)) {
      fail(
        `"${name}" belongs to the terminal itself, so a command can't use it.`,
      );
    }
    if (seen.has(name)) fail(`two terminal commands are named "${name}".`);
    seen.add(name);
    if ("run" in command) {
      if (!builtinNames.includes(command.run)) {
        fail(
          `the "${name}" command runs "${command.run}", which isn't a built-in command.`,
        );
      }
      if (command.run === "status" && !config?.status) {
        fail(
          `the "${name}" command runs status, but \`terminal.status\` isn't set.`,
        );
      }
    }
    if ("href" in command && command.href.startsWith("#")) {
      const hash = command.href.slice(1);
      if (!sections.some((section) => section.hash === hash)) {
        fail(
          `the "${name}" command links to ${command.href}, which isn't a section on the home page. Use one of ${sections.map((section) => `#${section.hash}`).join(", ")}.`,
        );
      }
    }
  }
}

/**
 * What `ls works` and `open` call each project: its case study slug, else its title in
 * lowercase with dashes. Repeats get "-2", "-3", so every project can still be opened.
 */
function projectNames() {
  const taken = new Map<string, number>();
  return siteConfig.projects.map((project, index) => {
    const base =
      project.caseStudy?.slug ??
      (project.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
        // A title with no Latin letters, e.g. in Japanese.
        `project-${index + 1}`);
    const count = (taken.get(base) ?? 0) + 1;
    taken.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

function build(): TerminalData {
  check();
  const names = projectNames();
  return {
    name: siteConfig.name,
    role: siteConfig.role,
    intro: siteConfig.hero.intro,
    email: siteConfig.email,
    location: siteConfig.location,
    timezone: timeZone,
    status: config?.status,
    about: siteConfig.about.paragraphs,
    stack: siteConfig.techStack,
    resume: siteConfig.resume,
    sections,
    // The palette's own project rows already pick the best link, so `open` goes the
    // same way.
    projects: siteConfig.projects.map((project, index): TerminalProject => {
      const { to, href } = paletteProjects[index];
      return {
        name: names[index],
        title: project.title,
        category: project.category,
        year: project.year?.toString(),
        href: kinds[to] ? href : null,
        kind: kinds[to],
      };
    }),
    releases: readReleases(),
    // `||`, not `??`: an empty prompt or joke list reads as "use the default".
    prompt: config?.prompt || defaultPrompt(siteConfig.name),
    jokes: config?.jokes?.length ? config.jokes : defaultJokes,
    nextVersion: nextPackage.version,
    launchedAt: config?.launched,
    disabled: config?.disable ?? [],
    custom: config?.commands ?? [],
  };
}

/**
 * What the palette's terminal needs, picked out of the config on the server so only
 * this reaches the browser. Null when `terminal.enabled` is false.
 */
export const terminalData: TerminalData | null =
  config?.enabled === false ? null : build();
