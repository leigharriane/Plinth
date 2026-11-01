#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

/*
 * `npx create-plinthfolio [directory]` copies a Plinth portfolio into a new folder, puts your
 * name in it, and installs it. No dependencies: everything here is Node.
 */

const here = dirname(fileURLToPath(import.meta.url));
const templateDir = resolve(here, "..", "template");
const own = JSON.parse(
  readFileSync(resolve(here, "..", "package.json"), "utf8"),
);

// The template stores these under names npm doesn't strip from a package.
const renames = {
  _gitignore: ".gitignore",
  "_package-lock.json": "package-lock.json",
};

// Placeholders in the template's plinth.config.ts that the prompts replace.
const placeholders = {
  name: "David Parker",
  role: "Software Engineer",
  email: "hello@example.com",
};

const colors = stdout.isTTY && !process.env.NO_COLOR;
const bold = (text) => (colors ? `\u001b[1m${text}\u001b[22m` : text);
const dim = (text) => (colors ? `\u001b[2m${text}\u001b[22m` : text);
const green = (text) => (colors ? `\u001b[32m${text}\u001b[39m` : text);

const usage = `
${bold("create-plinthfolio")} ${own.version}

Start a portfolio built with Plinth.

  ${bold("npx create-plinthfolio")} [directory] [options]

Options
  --name "Your Name"    Your name, as the site shows it
  --role "Your role"    What you do, e.g. "Frontend engineer"
  --email you@site.com  Where "Let's talk" sends mail
  -y, --yes             Skip the questions and keep the placeholders
  --no-install          Don't run the package manager
  --no-git              Don't create a git repository
  -h, --help            Show this
  -v, --version         Show the version
`;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function parse(argv) {
  const options = { install: true, git: true, yes: false };
  const takesValue = new Set(["--name", "--role", "--email"]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [flag, inline] = arg.startsWith("--") ? arg.split(/=(.*)/s) : [arg];
    if (flag === "-h" || flag === "--help") options.help = true;
    else if (flag === "-v" || flag === "--version") options.version = true;
    else if (flag === "-y" || flag === "--yes") options.yes = true;
    else if (flag === "--no-install") options.install = false;
    else if (flag === "--no-git") options.git = false;
    else if (takesValue.has(flag)) {
      const value = inline ?? argv[(i += 1)];
      if (value === undefined) fail(`${flag} needs a value.`);
      options[flag.slice(2)] = value;
    } else if (arg.startsWith("-")) fail(`Unknown option ${arg}.\n${usage}`);
    else if (options.dir === undefined) options.dir = arg;
    else fail(`One directory only (got "${options.dir}" and "${arg}").`);
  }
  return options;
}

function isEmpty(dir) {
  return !existsSync(dir) || readdirSync(dir).length === 0;
}

/** "My Site!" → "my-site", for the package name. */
function slug(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "portfolio"
  );
}

function copyDir(from, to, atRoot = true) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const source = join(from, entry);
    const name = atRoot ? (renames[entry] ?? entry) : entry;
    const target = join(to, name);
    if (statSync(source).isDirectory()) copyDir(source, target, false);
    else copyFileSync(source, target);
  }
}

/** Swaps one top-level string field in plinth.config.ts, keeping the placeholder's quoting. */
function setField(source, field, value) {
  const pattern = new RegExp(`^(  ${field}: )"[^"]*"`, "m");
  if (!pattern.test(source)) return source;
  return source.replace(pattern, `$1${JSON.stringify(value)}`);
}

function writeConfig(target, answers) {
  const path = join(target, "plinth.config.ts");
  let source = readFileSync(path, "utf8");
  for (const field of ["name", "role", "email"]) {
    if (answers[field]) source = setField(source, field, answers[field]);
  }
  // The demo's own marks: "p" on the favicon and its publisher line on link previews. A
  // new site wants its owner's initials and name there, which the defaults give.
  for (const field of ["icon", "siteName"]) {
    source = source.replace(
      new RegExp(`^[ \\t]*\\/\\/[^\\n]*\\n[ \\t]*${field}: "[^"]*",\\n`, "m"),
      "",
    );
  }
  writeFileSync(path, source);
}

function writePackage(target, answers) {
  const path = join(target, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.name = slug(basename(target));
  pkg.version = "0.1.0";
  pkg.description = answers.name
    ? `${answers.name}'s portfolio, built with Plinth.`
    : "A developer portfolio, built with Plinth.";
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

function writeReadme(target, answers, plinthVersion) {
  const title = answers.name ? `${answers.name}'s portfolio` : "My portfolio";
  writeFileSync(
    join(target, "README.md"),
    `# ${title}

[![Made with Plinth](https://img.shields.io/badge/Made%20with-Plinth-0019ff)](https://github.com/leigharriane/Plinth)

Built with [Plinth](https://github.com/leigharriane/Plinth) ${plinthVersion}, a developer portfolio you make your own by editing one file.

## Make it yours

1. Put your name, links, projects and experience in \`plinth.config.ts\`. Hover any field in your editor to see what it does.
2. Swap the placeholder files in \`public/\`: project thumbnails in \`public/images/projects/\` (16:10 fits best), company logos in \`public/images/logos/\`, and \`public/resume.pdf\` only if you'd rather link your own file than use the built-in \`/resume\` page.
3. Run it:

   \`\`\`bash
   npm run dev
   \`\`\`

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com/new). There's nothing to configure. Using a custom domain? Set \`url\` in \`plinth.config.ts\`.

## Checks

\`npm run lint\`, \`npm run typecheck\`, \`npm run format\` and \`npm run build\` are the same checks Plinth runs. \`npm run lighthouse\` scores a production build.
`,
  );
}

function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  for (const name of ["pnpm", "yarn", "bun"]) {
    if (agent.startsWith(`${name}/`)) return name;
  }
  return "npm";
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  return result.status === 0;
}

function hasGit(cwd) {
  const version = spawnSync("git", ["--version"], { stdio: "ignore" });
  if (version.status !== 0) return false;
  // Inside another repo already (a monorepo, say): leave its history alone.
  const inside = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    cwd,
    stdio: "ignore",
  });
  return inside.status !== 0;
}

async function main() {
  const options = parse(process.argv.slice(2));
  if (options.help) return console.log(usage);
  if (options.version) return console.log(own.version);
  if (!existsSync(templateDir)) {
    fail(
      "The template folder is missing. In the Plinth repo, run `npm run sync-template` inside packages/create-plinthfolio first.",
    );
  }
  const plinthVersion = JSON.parse(
    readFileSync(join(templateDir, "package.json"), "utf8"),
  ).version;

  console.log(
    `\n${bold("create-plinthfolio")} ${dim(`(Plinth ${plinthVersion})`)}\n`,
  );

  const interactive = stdin.isTTY && stdout.isTTY && !options.yes;
  const rl = interactive
    ? createInterface({ input: stdin, output: stdout })
    : null;
  const ask = async (question, fallback) => {
    if (!rl) return fallback;
    const answer = (
      await rl.question(`${question} ${dim(`(${fallback})`)} `)
    ).trim();
    return answer || fallback;
  };

  const dir = options.dir ?? (await ask("Where should it go?", "my-plinth"));
  const target = resolve(dir);
  if (!isEmpty(target)) {
    rl?.close();
    fail(
      `${relative(process.cwd(), target) || "."} already has files in it. Pick an empty folder.`,
    );
  }

  const answers = {
    name: options.name ?? (await ask("Your name?", placeholders.name)),
    role: options.role ?? (await ask("What do you do?", placeholders.role)),
    email: options.email ?? (await ask("Your email?", placeholders.email)),
  };
  rl?.close();

  console.log(
    `\nCopying Plinth into ${bold(relative(process.cwd(), target) || ".")}`,
  );
  copyDir(templateDir, target);
  writeConfig(target, answers);
  writePackage(target, answers);
  writeReadme(target, answers, plinthVersion);

  if (options.git && hasGit(target)) {
    const ok =
      run("git", ["init", "-q"], target) &&
      run("git", ["add", "-A"], target) &&
      run("git", ["commit", "-q", "-m", "Start from Plinth"], target);
    if (ok) console.log("Started a git repository.");
    else {
      rmSync(join(target, ".git"), { recursive: true, force: true });
      console.log(
        dim(
          "Couldn't make the first commit, so there's no git repository yet.",
        ),
      );
    }
  }

  const pm = packageManager();
  if (options.install) {
    // The lockfile is npm's. Another package manager writes its own.
    if (pm !== "npm")
      rmSync(join(target, "package-lock.json"), { force: true });
    console.log(`\nInstalling with ${pm}.\n`);
    if (!run(pm, ["install"], target)) {
      console.log(
        dim(`\n${pm} install didn't finish. Run it again inside the folder.`),
      );
    }
  }

  const cd = relative(process.cwd(), target) || ".";
  const runDev = pm === "npm" ? "npm run dev" : `${pm} dev`;
  console.log(`
${green("Done.")} Next:

  cd ${cd}${options.install ? "" : `\n  ${pm} install`}
  ${runDev}

Then open plinth.config.ts and make it yours. The site is at http://localhost:3000.
`);
}

main().catch((error) => fail(error?.message ?? String(error)));
