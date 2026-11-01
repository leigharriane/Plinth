/**
 * Plinth itself: the template this site is built with. It shows up where developers
 * look (the terminal, the console, the generator tag, llms.txt), never in the owner's
 * own copy. The version lives in `lib/plinth-version.ts`, which only the server reads.
 */
export const plinth = {
  name: "Plinth",
  author: "Leigh Arriane",
  url: "https://github.com/leigharriane/Plinth",
  tagline: "A developer portfolio you make your own by editing one file.",
} as const;
