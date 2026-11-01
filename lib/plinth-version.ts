import pkg from "@/package.json";

/**
 * Plinth's version from package.json. Kept apart from `lib/plinth.ts` so the terminal,
 * which runs in the browser, doesn't pull package.json into the client bundle.
 */
export const plinthVersion: string = pkg.version;
