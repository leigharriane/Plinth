# Plinth

A clean, accessible developer portfolio you make your own by editing one file. It's built with Next.js, TypeScript and Tailwind CSS, and there's no backend, no API keys and no environment variables to set up.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshot-dark.png" />
  <img alt="Plinth portfolio template: hero section with name, role, intro, Let's Talk and Resume buttons, and a scrolling skills band" src="docs/screenshot-light.png" />
</picture>

**Live demo:** _coming soon_ <!-- Replace with your deployment URL, e.g. https://plinth-demo.vercel.app -->

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fleigharriane%2FPlinth)

## Features

| Feature               | What you get                                                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One config file       | Every word, link and image on the page comes from `site.config.ts`. It's fully typed, so your editor tells you when something's missing.                                                                                                  |
| Light and dark themes | They follow the visitor's system setting, and there's a toggle too.                                                                                                                                                                       |
| Sections              | Hero, skills marquee, Recent Works carousel, about, tech stack marquee, experience tabs, a contact call to action and a footer.                                                                                                           |
| Case studies          | Any project can carry a `caseStudy`: role, timeline, stack, outcomes and the story. It gets a Read case study link on the card and a static page with its own social image.                                                               |
| Resume page           | `/resume` is built from your config, so it never drifts from the site. Print it or save it as a PDF from the print dialog.                                                                                                                |
| Command palette       | ⌘K or Ctrl+K (or the search button in the nav) jumps to a section, opens the resume, copies your email, switches theme or opens a profile.                                                                                                |
| Accessible            | Semantic landmarks, visible focus, a carousel and tabs that work from the keyboard, 44px touch targets, WCAG AA contrast in both themes, and a pause button on the marquees. Motion stops completely if a visitor prefers reduced motion. |
| Fast                  | It's fully static. Lighthouse scores 98–100 on mobile and 100 on desktop for Performance, Accessibility, Best Practices and SEO.                                                                                                          |
| Shareable             | Page metadata, a generated social preview image and favicon, `sitemap.xml` and `robots.txt`, all built from your config.                                                                                                                  |

## Customize in 3 steps

1. **Get your own copy.** Click **Use this template** on GitHub (or the Deploy button above, which copies the repo for you). Then clone it and start the dev server:

   ```bash
   git clone https://github.com/<you>/<your-repo>.git
   cd <your-repo>
   npm install
   npm run dev
   ```

2. **Make it yours.** Put your name, links, projects and experience in `site.config.ts`. Then swap out the placeholder files in `public/`:

   | Path                      | What goes there                                                     |
   | ------------------------- | ------------------------------------------------------------------- |
   | `public/resume.pdf`       | Only if you'd rather link your own file than use the built-in page. |
   | `public/images/projects/` | Project thumbnails. Any aspect ratio works, but 4:3 fits best.      |
   | `public/images/logos/`    | Square company logos.                                               |

3. **Deploy.** Push to GitHub and import the repo on [Vercel](https://vercel.com/new). You don't have to configure anything: Vercel hands the site its URL for links and social previews. Using a custom domain? Set `url` in `site.config.ts`.

## Configuration

Everything lives in [`site.config.ts`](site.config.ts). Each field is documented in the types in [`lib/config.ts`](lib/config.ts), so you can hover a field in your editor to see what it does.

| Field                 | What it does                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `role`        | Your name and job title. They show up across the page, metadata and social image.                                                            |
| `url`                 | Optional. Your public URL. Leave it out and Vercel's production URL is used.                                                                 |
| `email`               | Where the **Let's Talk** buttons send mail.                                                                                                  |
| `resume`              | `"/resume"` for the page built from this config, a file in `public/`, or `null`.                                                             |
| `hero`                | The greeting, tagline and intro paragraph.                                                                                                   |
| `skills`, `techStack` | The two scrolling bands.                                                                                                                     |
| `projects`            | Carousel cards: title, description, category, year, tags, image and links. Add a `caseStudy` to give a card its own page at `/works/<slug>`. |
| `about`               | Your paragraphs, the panel's label and headline, and an optional year.                                                                       |
| `experience`          | One tab per job: company, role, logo, dates and description paragraphs.                                                                      |
| `cta`                 | The heading and text above the footer.                                                                                                       |
| `socials`             | Icon links. The `SocialPlatform` type lists every supported platform.                                                                        |
| `seo.description`     | Optional. The description for search and social previews. Defaults to `hero.intro`.                                                          |

Images can be paths under `public/` or full URLs. Remote images and SVGs are served as-is, so you don't need to touch `next.config.ts`.

### Colors and fonts

The palette and type scale are CSS variables at the top of [`app/globals.css`](app/globals.css), with separate light and dark values. The font is [Albert Sans](https://fonts.google.com/specimen/Albert+Sans), and it's loaded in [`app/layout.tsx`](app/layout.tsx).

## Development

You'll need Node.js 20.9 or later.

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Starts the dev server on localhost:3000.  |
| `npm run build`        | Builds for production.                    |
| `npm run start`        | Serves the production build.              |
| `npm run lint`         | Runs ESLint.                              |
| `npm run typecheck`    | Type-checks with TypeScript (no emit).    |
| `npm run format`       | Formats everything with Prettier.         |
| `npm run format:check` | Checks formatting without changing files. |

## For maintainers: make this a template repository

On GitHub, open **Settings → General** and tick **Template repository**. That gives people a **Use this template** button, so they don't have to fork.

## License

[MIT](LICENSE)
