import siteConfig from "@/site.config";

const configured = siteConfig.url?.trim();

/**
 * The site's public origin: `url` from site.config.ts, else the production domain
 * Vercel exposes at build time, else localhost for local builds. A configured URL
 * without a scheme ("my-site.com") gets https:// added.
 */
export const siteUrl = parse(
  configured ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

function parse(value: string) {
  const withScheme = /^https?:\/\//.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme);
  } catch {
    throw new Error(
      `site.config.ts: \`url\` must be a full address like "https://your-domain.com" (got "${value}").`,
    );
  }
}
