import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Release = {
  version: string;
  /** As written in the changelog, e.g. "2026-11-01". */
  date?: string;
  /** One line per change, without the Markdown. */
  changes: string[];
};

/** "**palette:** add terminal mode ([abc1234](url))" → "palette: add terminal mode". */
function plain(line: string) {
  return (
    line
      // The commit and PR links release-please adds at the end.
      .replace(/(\s*\(\[[^\]]*\]\([^)]*\)\))+\s*$/, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*/g, "")
      .trim()
  );
}

/**
 * The newest releases in CHANGELOG.md, as release-please writes it. An empty list when
 * there's no changelog yet, which is the case until the first release. Read at build,
 * so it's synchronous like the rest of the config.
 */
export function readReleases(count = 2, changesEach = 5) {
  let markdown: string;
  try {
    markdown = readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8");
  } catch {
    return [];
  }
  return markdown
    .split(/^## /m)
    .slice(1)
    .slice(0, count)
    .map((section): Release => {
      const [heading, ...lines] = section.split("\n");
      return {
        version: heading.match(/\d+\.\d+\.\d+[\w.-]*/)?.[0] ?? heading.trim(),
        date: heading.match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1],
        changes: lines
          .filter((line) => /^[*-] /.test(line))
          .map((line) => plain(line.slice(2)))
          .slice(0, changesEach),
      };
    });
}
