import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Copies the Plinth repo into ./template, which is what `npx create-plinthfolio` unpacks. It
 * runs before `npm pack` and `npm publish` (see "prepack"), so the published package
 * always carries the Plinth version it was packed from.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");
const out = resolve(here, "..", "template");

// Left out wherever they appear.
const skipNames = new Set([
  ".git",
  "node_modules",
  ".next",
  "out",
  "build",
  ".lighthouseci",
  ".vercel",
  ".claude",
  ".DS_Store",
  "tsconfig.tsbuildinfo",
  "next-env.d.ts",
]);

// Left out at these paths: Plinth's own docs, releases, to do list, labs and this package.
const skipPaths = new Set([
  "README.md",
  "CHANGELOG.md",
  "TODO.md",
  "docs",
  "packages",
  "components/lab",
  "release-please-config.json",
  ".release-please-manifest.json",
  ".github/workflows/release-please.yml",
]);

// npm drops these from a package under their real names, so the template renames them.
// The CLI puts the real names back.
const renames = {
  ".gitignore": "_gitignore",
  "package-lock.json": "_package-lock.json",
};

let count = 0;

function copy(dir) {
  for (const entry of readdirSync(dir)) {
    const from = join(dir, entry);
    const rel = relative(root, from).split("\\").join("/");
    if (skipNames.has(entry) || skipPaths.has(rel)) continue;
    const name = dir === root ? (renames[entry] ?? entry) : entry;
    const to = join(out, relative(root, dir), name);
    if (statSync(from).isDirectory()) {
      mkdirSync(to, { recursive: true });
      copy(from);
    } else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
      count += 1;
    }
  }
}

rmSync(out, { recursive: true, force: true });
copy(root);
console.log(
  `Copied ${count} files into ${relative(process.cwd(), out) || "."}`,
);
