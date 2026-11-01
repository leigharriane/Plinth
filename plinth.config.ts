import { defineConfig } from "@/lib/config";

/**
 * Everything personal on your site lives here. Edit the values below, swap
 * the placeholder files in /public, and deploy. Hover any field in your
 * editor to see what it does (the docs live in lib/config.ts).
 */
export default defineConfig({
  name: "David Parker",
  role: "Software Engineer",
  // Optional on Vercel. Uncomment and set this if you use a custom domain.
  // url: "https://your-domain.com",
  email: "hello@example.com",
  // Optional. Where you're based.
  location: "Manila, Philippines",
  // "/resume" is a page built from this file. Use "/resume.pdf" for your own file, or null to hide the button.
  resume: "/resume",
  // Shows your local time in the footer. Remove it to hide the clock.
  timezone: "Asia/Manila",
  // Optional. What search results and link previews say about the site. Leave it out to use `hero.intro`.
  seo: {
    description: "A developer portfolio you make your own by editing one file.",
    // The publisher line on link previews. This one is the demo's, so remove it on your own site.
    siteName: "Plinth by Leigh Arriane",
  },

  hero: {
    greeting: "Hello! I am",
    tagline: "A Software Engineer",
    intro:
      "I build fast, accessible web apps from first sketch to launch. Right now it's scheduling tools for clinics. Open to new roles.",
    // The glow behind the heading follows the mouse across it. Use "static" to keep it still, or "off".
    // glow: "static",
    // Your first three project images fan out at the bottom of the hero. Set false to hide them.
    // peek: false,
  },

  skills: [
    "Game Development",
    "DevOps",
    "Full-stack Development",
    "Mobile Application",
  ],

  techStack: [
    "HTML",
    "CSS",
    "MySQL",
    "Firebase",
    "Python",
    "Java",
    "Node.js",
    "React",
    "JavaScript",
  ],

  projects: [
    {
      title: "Real Estate Website",
      description:
        "Property listings with map search, saved favorites and agent contact forms.",
      category: "Website",
      year: 2025,
      tags: ["React", "TypeScript", "Postgres"],
      image: {
        src: "/images/projects/real-estate.svg",
        alt: "Placeholder thumbnail for the Real Estate Website project",
      },
      links: { github: "https://github.com/", live: "https://example.com/" },
      // Optional. Gives the card a "Read case study" link and a page at /works/real-estate-website.
      caseStudy: {
        slug: "real-estate-website",
        summary:
          "Map search, saved favorites and agent contact forms for a regional property agency.",
        role: "Full-stack developer, solo",
        timeline: "10 weeks, 2025",
        stack: [
          "Next.js",
          "TypeScript",
          "PostgreSQL",
          "Mapbox",
          "Tailwind CSS",
        ],
        outcomes: [
          { value: "3.1×", label: "more inquiries per month" },
          { value: "1.4s", label: "mobile LCP, down from 5.2s" },
          { value: "100", label: "Lighthouse accessibility" },
        ],
        body: [
          { type: "h2", text: "The problem" },
          {
            type: "p",
            text: "The agency's old site was a WordPress theme with a plugin for listings. Search took a full page load per filter, the map was an iframe, and agents were getting inquiries with no record of which property they were about.",
          },
          { type: "h2", text: "What I built" },
          {
            type: "p",
            text: "A Next.js app with server-rendered listing pages for SEO, a client-side map that filters as you pan, and a favorites list that works signed out (localStorage) and syncs when you sign in. Each inquiry form carries the listing id, so agents see context in their inbox.",
          },
          {
            type: "code",
            lang: "ts",
            text: `// Listings re-query as the map moves, debounced so we don't hammer the API.
  const bounds = useDebouncedValue(map.getBounds(), 250);
  const { data } = useListings({ bounds, filters });`,
          },
          { type: "h2", text: "What I'd do differently" },
          {
            type: "p",
            text: "Start with the data model. I changed the listing schema twice after launch to support rentals, which meant two migrations I could have avoided with a week of upfront questions.",
          },
          {
            type: "quote",
            text: "Inquiries tripled and, for the first time, we know which listing each one is about.",
            cite: "Agency owner",
          },
        ],
      },
    },
    {
      title: "Indie Game",
      description:
        "A small 2D platformer with hand-drawn levels, built over a weekend game jam.",
      category: "Game",
      year: 2024,
      tags: ["Godot", "GDScript"],
      image: {
        src: "/images/projects/indie-game.svg",
        alt: "Placeholder thumbnail for the Indie Game project",
      },
      links: { github: "https://github.com/", live: "https://example.com/" },
    },
    {
      title: "Restaurant Website",
      description:
        "Menu, online reservations and an events page for a local family restaurant.",
      category: "Website",
      year: 2024,
      tags: ["Next.js", "Tailwind CSS"],
      image: {
        src: "/images/projects/restaurant.svg",
        alt: "Placeholder thumbnail for the Restaurant Website project",
      },
      links: { github: "https://github.com/", live: "https://example.com/" },
    },
    {
      title: "Habit Tracker App",
      description:
        "A cross-platform mobile app for building daily habits with streaks and reminders.",
      category: "Mobile app",
      year: 2023,
      tags: ["React Native", "Expo", "SQLite"],
      image: {
        src: "/images/projects/habit-tracker.svg",
        alt: "Placeholder thumbnail for the Habit Tracker App project",
      },
      links: { github: "https://github.com/" },
      caseStudy: {
        slug: "habit-tracker-app",
        summary:
          "A cross-platform mobile app for building daily habits with streaks and reminders.",
        role: "Mobile developer, with one designer",
        timeline: "6 weeks, 2024",
        stack: ["React Native", "Expo", "SQLite", "TypeScript"],
        outcomes: [
          { value: "4.8", label: "store rating from 120 reviews" },
          { value: "62%", label: "day-30 retention" },
          { value: "0", label: "crash reports in the first month" },
        ],
        body: [
          { type: "h2", text: "The problem" },
          {
            type: "p",
            text: "Most habit apps make you sign up before you've tracked a single thing. We wanted the first habit logged within ten seconds of opening the app, and everything to work offline.",
          },
          { type: "h2", text: "What I built" },
          {
            type: "p",
            text: "A local-first app on SQLite with optional cloud backup. Reminders use the platform notification APIs with a daily batch, so the app never needs to wake up in the background. Streak logic is a pure function with a test for every edge case we could think of, including timezone changes mid-streak.",
          },
          { type: "h2", text: "What I learned" },
          {
            type: "p",
            text: "Timezones are the whole problem. A streak that resets at midnight has to decide whose midnight, and we settled on the device's local day with a grace window.",
          },
        ],
      },
    },
  ],

  about: {
    paragraphs: [
      "I'm a developer who enjoys the whole journey from rough idea to shipped product, and I care about the details that make software feel good to use.",
      "When I'm not coding, I'm making small games, reading about design, or helping friends get their first projects online.",
    ],
    label: "about me",
    headline: "Get to know me.",
  },

  experience: [
    {
      company: "Acme Corp",
      role: "Software Engineer Intern",
      logo: "/images/logos/acme-corp.svg",
      start: "July 2022",
      end: "October 2022",
      description: [
        "Built internal dashboards in React and TypeScript, and cut the admin tools' page load from 4s to 1.2s.",
        "Turned the design team's Figma mockups into 20 accessible, reusable components.",
      ],
    },
    {
      company: "Northwind Studio",
      role: "Junior Software Engineer",
      logo: "/images/logos/northwind-studio.svg",
      start: "January 2023",
      end: "December 2023",
      description: [
        "Shipped 12 marketing sites and online stores for small business clients.",
        "Set up CI and automated visual checks that caught layout bugs before each release.",
      ],
    },
    {
      company: "Brightline Labs",
      role: "Software Engineer",
      logo: "/images/logos/brightline-labs.svg",
      start: "February 2024",
      end: "Present",
      description: [
        "Build full-stack features for a scheduling platform that 40 clinics use every day.",
        "Mentor interns and lead the team's accessibility reviews.",
      ],
    },
  ],

  cta: {
    heading: "Let’s work together!",
    text: "Have a project in mind, or want to say hi? My inbox is always open.",
  },

  socials: [
    { platform: "linkedin", url: "https://www.linkedin.com/" },
    { platform: "github", url: "https://github.com/leigharriane" },
    { platform: "facebook", url: "https://www.facebook.com/" },
    { platform: "discord", url: "https://discord.com/" },
  ],

  // The command palette doubles as a terminal. Open it with ⌘K and type help. All optional.
  terminal: {
    // What `status` prints. Change it to yours, or remove it to drop the command.
    status: "Open to new roles.",
    // The day your site went live, for the uptime in `neofetch`. Set yours, or remove it.
    launched: "2026-10-30",
    // prompt: "david@plinth ~ $",
    // jokes: ["Your own one-liners for the joke command."],
    // Your own commands. Each one prints text, opens a link, or runs a built-in.
    commands: [
      { name: "hire", description: "How to hire me", run: "email" },
      // { name: "blog", description: "Read my blog", href: "https://example.com/blog" },
      // { name: "hello", description: "Say hi", print: "Hi! Thanks for stopping by." },
    ],
    // Turn off any built-in you don't want, e.g. disable: ["rm", "sudo"]. `whatsnew`
    // reads CHANGELOG.md, so add it here if your changelog isn't about your site.
  },
});
