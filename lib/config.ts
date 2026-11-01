/**
 * Types for `plinth.config.ts`. You shouldn't need to edit this file. Change
 * your content in `plinth.config.ts`, and these types will tell you if
 * anything's missing or misspelled.
 */

export type Image = {
  /** A path inside /public, starting with "/" (e.g. "/images/projects/shop.png"), or a full URL. */
  src: string;
  /** What the image shows, for screen-reader users, e.g. "Home screen of the Habit Tracker app". Required. */
  alt: string;
};

/** The networks a social link can point to. Each one has its own icon. */
export type SocialPlatform =
  | "github"
  | "gitlab"
  | "linkedin"
  | "x"
  | "bluesky"
  | "mastodon"
  | "facebook"
  | "instagram"
  | "threads"
  | "discord"
  | "youtube"
  | "twitch"
  | "dribbble"
  | "behance"
  | "medium"
  | "devto"
  | "stackoverflow"
  | "email";

export type Social = {
  /** Which network this is, e.g. "github". Sets the icon. */
  platform: SocialPlatform;
  /** Full profile URL, e.g. "https://github.com/you". For `email`, a plain address like "you@example.com" works. */
  url: string;
  /** Accessible name for the icon link. Leave it out to use the platform name, e.g. "GitHub". */
  label?: string;
};

/** One piece of a case study body. A few shapes on purpose, so there's no Markdown setup. */
export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; text: string; lang?: string };

export type CaseStudy = {
  /** The page lives at /works/<slug>. Lowercase letters, numbers and hyphens, e.g. "habit-tracker". */
  slug: string;
  /** One line under the title. */
  summary: string;
  /** What you did, e.g. "Full-stack developer, solo". */
  role: string;
  /** How long and when, e.g. "6 weeks, 2024". */
  timeline: string;
  /** Tech used, shown as pills in the sidebar. */
  stack: string[];
  /**
   * The wide image under the summary. Leave it out to reuse the project's card `image`, or
   * set `false` for none. It's shown at 16:10, like the card, but never taller than 60% of
   * the screen, and then cropped from the bottom, so keep the important part near the top.
   */
  image?: Image | false;
  /** Headline numbers, shown big above the body. Keep it to three or four. */
  outcomes?: { value: string; label: string }[];
  /** The story, as headings, paragraphs, quotes and code blocks. */
  body: Block[];
};

export type Project = {
  /** Card heading, e.g. "Habit tracker". */
  title: string;
  /**
   * One or two sentences under the title. Say what it does or what you built. Keep it
   * around 100 characters. Longer text gets cut off after 3 lines on the card.
   */
  description: string;
  /** The pill on the card, e.g. "Website". */
  category: string;
  /** Shown next to the category, e.g. 2024. Leave it out to show none. */
  year?: number | string;
  /** Tech you used, shown as small pills, e.g. ["React", "TypeScript"]. Up to 4 are shown; the rest become "+N". */
  tags?: string[];
  /**
   * Card thumbnail. Any aspect ratio works, but 16:10 fits best (e.g. 1280×800). The first
   * three projects' images also fan out at the bottom of the hero, cropped to their top.
   */
  image: Image;
  /** Adds a "Read case study" link to the card and a page at /works/<slug>. */
  caseStudy?: CaseStudy;
  /**
   * Where the card links. The title opens `live`, and `github` gets its own "Code" link.
   * With only `github`, the title opens the repo instead. Leave out `links` for a card with no links.
   */
  links?: {
    /** Repo URL, e.g. "https://github.com/you/habit-tracker". */
    github?: string;
    /** URL of the live site or app. */
    live?: string;
  };
};

export type Experience = {
  /** Company name, e.g. "Acme Corp". */
  company: string;
  /** Your job title there, e.g. "Junior Software Engineer". */
  role: string;
  /**
   * A square logo, as a path inside /public (e.g. "/images/logos/acme-corp.svg") or a
   * full URL. It sits next to the company name, so it doesn't need alt text.
   */
  logo: string;
  /** When you started. Free text, e.g. "July 2022". Use the same format for every job. */
  start: string;
  /** When you left. Free text, e.g. "October 2022", or "Present" if you still work there. */
  end: string;
  /** What you did there. One string per paragraph. */
  description: string[];
};

/** The palette terminal's built-in commands that can be turned off. */
export type TerminalBuiltin =
  | "whoami"
  | "ls"
  | "cd"
  | "open"
  | "cat"
  | "email"
  | "status"
  | "stack"
  | "theme"
  | "date"
  | "whatsnew"
  | "neofetch"
  | "plinth"
  | "joke"
  | "secrets"
  | "sudo"
  | "rm"
  | "matrix"
  | "coffee"
  | "vim"
  | "ping"
  | "cowsay"
  | "sl";

/** A command of your own for the palette terminal. It prints text, opens a link, or runs a built-in. */
export type TerminalCommand = {
  /**
   * What visitors type, e.g. "blog". One lowercase word: letters, numbers, "-" and "_".
   * A built-in with the same name is replaced. help, clear and exit are the terminal's
   * own, so they can't be used. The build stops with a message if a name breaks a rule.
   */
  name: string;
  /** One line for `help` and the Run row, e.g. "Read my blog". */
  description: string;
  /** Leaves it out of `help` and partial matches, so it has to be typed in full. For easter eggs. */
  hidden?: boolean;
} & (
  | {
      /** Text to print. Use "\n" for a new line. */
      print: string;
    }
  | {
      /**
       * Where to go: a path on this site like "/resume", a home page section like
       * "#about", or a full URL, which opens in a new tab.
       */
      href: string;
    }
  | {
      /** A built-in to run under this name, e.g. "email" for a `hire` command. */
      run: TerminalBuiltin;
    }
);

export type SiteConfig = {
  /** Your full name. It shows up in the nav, page title, footer and favicon initials. */
  name: string;
  /**
   * One or two letters for the favicon and the terminal's pedestal art. Leave it out to use
   * your initials, e.g. "dp" for David Parker. The demo sets "p" for Plinth, so remove it on yours.
   */
  icon?: string;
  /** Your job title, e.g. "Software Engineer". Used in page metadata and the social preview image. */
  role: string;
  /**
   * Your site's public URL, e.g. "https://your-domain.com". It's used for
   * canonical links, the sitemap and social previews. On Vercel you can leave
   * it out and the production URL Vercel provides is used. Hosting somewhere
   * else? Set it, or those links will point at localhost.
   */
  url?: string;
  /** Where the "Let's talk" buttons send mail, e.g. "you@example.com". */
  email: string;
  /**
   * Where you're based, e.g. "Manila, Philippines". The palette's terminal shows it in
   * `whoami` and `date`. Leave it out to show none.
   */
  location?: string;
  /**
   * What the Resume button opens. "/resume" is a page built from this config (your
   * experience and skills, printable and saveable as a PDF). A path inside /public,
   * e.g. "/resume.pdf", downloads that file instead. Set it to null to hide the button.
   */
  resume: "/resume" | (string & {}) | null;
  /**
   * Your time zone, e.g. "Asia/Manila". The footer shows your local time ("3:42 PM in
   * Manila"), so visitors can tell when you're likely to reply. Use a name from the list at
   * https://en.wikipedia.org/wiki/List_of_tz_database_time_zones. Leave it out to hide it.
   */
  timezone?: string;
  hero: {
    /** First line of the heading, e.g. "Hi, I'm". */
    greeting: string;
    /**
     * Middle line of the heading, e.g. "David Parker". Leave it out to use your `name`. Set it
     * to show something else here, like a first name or a nickname, without changing your
     * name everywhere else (metadata, footer, resume).
     */
    name?: string;
    /** Last line of the heading, e.g. "Software engineer". */
    tagline: string;
    /** Short paragraph under the heading. It's also the default meta description. */
    intro: string;
    /**
     * How the soft glow behind your heading behaves. `"pointer"` drifts after the visitor's
     * mouse and rests centered behind the heading when there's no mouse (phones, tablets) or
     * the visitor prefers reduced motion. `"static"` keeps it still, low and off to the left
     * of the heading. `"off"` removes it. Defaults to `"pointer"`.
     */
    glow?: "pointer" | "static" | "off";
    /**
     * Shows the first three project thumbnails fanned at the bottom of the hero, linking
     * down to Recent work. It shows only the top of each image, so set it to `false` if
     * your screenshots don't read well that small. Defaults to `true`.
     */
    peek?: boolean;
  };
  /** Words that scroll across the blue band under the hero. Leave it empty to hide the band. */
  skills: string[];
  /** Words that scroll in large type above the experience section. Leave it empty to hide them. */
  techStack: string[];
  /** Cards in the Recent work carousel. Leave it empty to hide the section. */
  projects: Project[];
  /**
   * The about section. Under the text it shows your GitHub contributions and latest
   * repos, read from the GitHub link in `socials`, e.g. "https://github.com/you".
   */
  about: {
    /** One string per paragraph. */
    paragraphs: string[];
    /** Small heading above the headline, e.g. "about me". */
    label: string;
    /** Large heading next to your paragraphs. A few words reads best, like "Get to know me." */
    headline: string;
    /** Shown after the label, e.g. 2024. Leave it out to show the visitor's current year. */
    year?: number | string;
  };
  /** One tab per job, in the order you list them. Leave it empty to hide the section. */
  experience: Experience[];
  /** The closing section above the footer. */
  cta: {
    /** Large heading, e.g. "Looking for my next team". */
    heading: string;
    /** Short paragraph next to the heading. */
    text: string;
  };
  /**
   * Icon links in the closing section, shown in the order you list them. Include your
   * GitHub profile URL to show your contributions and repos in the about section.
   */
  socials: Social[];
  /**
   * The command palette doubles as a small terminal: type `help` in it to see the
   * commands. Everything here is optional.
   */
  terminal?: {
    /** Set to `false` to turn the terminal off. The palette keeps working as before. */
    enabled?: boolean;
    /**
     * Shown before each command. Defaults to your first name, e.g. "david@plinth ~ $". The
     * "name@host" part also heads `neofetch`.
     */
    prompt?: string;
    /** What `status` prints, e.g. "Open to new roles.". Leave it out and there's no `status`. */
    status?: string;
    /**
     * The day your site went live, as "YYYY-MM-DD", e.g. "2026-10-30", for the uptime in
     * `neofetch`. Leave it out to hide the uptime.
     */
    launched?: string;
    /** Lines for `joke` and `fortune`. Leave it out, or empty, to use the built-in programmer jokes. */
    jokes?: string[];
    /**
     * Built-in commands to turn off, e.g. `["sudo", "rm"]`. Turning off one turns off its
     * other names too, so "joke" takes `fortune` with it. `whatsnew` prints the newest
     * entries in CHANGELOG.md, so turn it off if your fork's changelog isn't about your site.
     */
    disable?: TerminalBuiltin[];
    /** Commands of your own. Each one prints text, opens a link, or runs a built-in. */
    commands?: TerminalCommand[];
  };
  /** Optional search and link preview settings. */
  seo?: {
    /** The description in search results and link previews. Leave it out to use `hero.intro`. */
    description?: string;
    /**
     * The site name on link previews (the small line under the title on Slack, iMessage
     * and X). Leave it out to use `name`, which is right for your own portfolio.
     */
    siteName?: string;
  };
};

/** Gives `plinth.config.ts` full type checking and autocomplete. It returns your config unchanged. */
export function defineConfig(config: SiteConfig): SiteConfig {
  return config;
}
