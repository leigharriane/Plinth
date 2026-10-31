// Lighthouse CI config. Runs on every pull request (see .github/workflows/lighthouse.yml),
// or locally with `npm run build && npm run lighthouse`.
const fs = require("node:fs");

// Its own port, so a dev server already running on 3000 isn't measured by mistake.
const port = 3100;
const origin = `http://localhost:${port}`;

// Every page in the built sitemap, so new case studies are checked without editing this file.
function pagesFromSitemap() {
  try {
    const xml = fs.readFileSync(".next/server/app/sitemap.xml.body", "utf8");
    const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      ([, loc]) => new URL(loc).pathname,
    );
    if (paths.length > 0) return paths.map((path) => origin + path);
  } catch {}
  return [`${origin}/`];
}

const kb = (size) => size * 1024;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm run start -- --port ${port}`,
      startServerReadyPattern: "Ready",
      url: pagesFromSitemap(),
      // Three runs per page, and the median is asserted, to smooth out a noisy runner.
      numberOfRuns: 3,
    },
    assert: {
      aggregationMethod: "median-run",
      // Lighthouse's default mobile run. Each limit sits a little past what the template
      // scores today, so a pull request fails only when it makes things clearly worse.
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Bytes over the wire, compressed. Images are left out, since they're your content.
        "resource-summary:script:size": ["error", { maxNumericValue: kb(200) }],
        "resource-summary:stylesheet:size": [
          "error",
          { maxNumericValue: kb(25) },
        ],
        "resource-summary:font:size": ["error", { maxNumericValue: kb(50) }],
        "resource-summary:third-party:count": ["error", { maxNumericValue: 0 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
