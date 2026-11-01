import siteConfig from "@/plinth.config";

/**
 * The `timezone` from plinth.config.ts in its canonical spelling, or undefined when it's left
 * out. Checked at build, so a typo fails the build instead of quietly hiding the clock.
 */
export const timeZone = parse(siteConfig.timezone);

/** The city in a zone name, e.g. "Buenos Aires" from "America/Argentina/Buenos_Aires". */
export const timeZonePlace = timeZone?.split("/").pop()?.replaceAll("_", " ");

function parse(value: string | undefined) {
  if (!value) return undefined;
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).resolvedOptions().timeZone;
  } catch {
    throw new Error(
      `plinth.config.ts: \`timezone\` must be a time zone name like "Asia/Manila" (got "${value}").`,
    );
  }
}
