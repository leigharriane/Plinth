/**
 * Types for `site.config.ts`. You shouldn't need to edit this file. Change
 * your content in `site.config.ts`, and these types will tell you if
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
  /** Headline numbers, shown big above the body. Keep it to three or four. */
  outcomes?: { value: string; label: string }[];
  /** The story, as headings, paragraphs, quotes and code blocks. */
  body: Block[];
};

export type Project = {
  /** Card heading, e.g. "Habit Tracker App". */
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

export type SiteConfig = {
  /** Your full name. It shows up in the nav, page title, footer and favicon initials. */
  name: string;
  /** Your job title, e.g. "Software Engineer". Used in page metadata and the social preview image. */
  role: string;
  /**
   * Your site's public URL, e.g. "https://your-domain.com". It's used for
   * canonical links, the sitemap and social previews. On Vercel you can leave
   * it out and the production URL Vercel provides is used. Hosting somewhere
   * else? Set it, or those links will point at localhost.
   */
  url?: string;
  /** Where the "Let’s talk" buttons send mail, e.g. "you@example.com". */
  email: string;
  /**
   * What the Resume button opens. "/resume" is a page built from this config (your
   * experience and skills, printable and saveable as a PDF). A path inside /public,
   * e.g. "/resume.pdf", downloads that file instead. Set it to null to hide the button.
   */
  resume: "/resume" | (string & {}) | null;
  hero: {
    /** First line of the heading, e.g. "Hello! I am". */
    greeting: string;
    /** Last line of the heading, e.g. "A Software Engineer". */
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
    /** Large heading, e.g. "Let’s work together". */
    heading: string;
    /** Short paragraph next to the heading. */
    text: string;
  };
  /**
   * Icon links in the closing section, shown in the order you list them. Include your
   * GitHub profile URL to show your contributions and repos in the about section.
   */
  socials: Social[];
  /** Optional search and link preview settings. */
  seo?: {
    /** The description in search results and link previews. Leave it out to use `hero.intro`. */
    description?: string;
  };
};

/** Gives `site.config.ts` full type checking and autocomplete. It returns your config unchanged. */
export function defineConfig(config: SiteConfig): SiteConfig {
  return config;
}
