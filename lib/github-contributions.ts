import siteConfig from "@/plinth.config";

export type ContributionDay = {
  date: string;
  /** GitHub's own 0–4 shading bucket, relative to the person's busiest days. */
  level: number;
  count: number;
};

export type Contributions = {
  username: string;
  total: number;
  /** Oldest first, one entry per day for the last year. */
  days: ContributionDay[];
};

/** The username from the GitHub link in `socials`, or null when it's missing or bare. */
export function githubUsername(): string | null {
  const link = siteConfig.socials.find(
    (social) => social.platform === "github",
  );
  if (!link) return null;
  try {
    const [name] = new URL(link.url).pathname.split("/").filter(Boolean);
    return name ?? null;
  } catch {
    return null;
  }
}

const attribute = (tag: string, name: string) =>
  tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];

/**
 * The last year of public contributions, read from the HTML fragment GitHub's profile
 * page loads. It needs no token, so the template keeps zero env vars, but it isn't an
 * official API: if the markup changes this returns null and the graph hides itself.
 * Cached for a day.
 */
export async function getContributions(
  username: string,
): Promise<Contributions | null> {
  try {
    const response = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      { next: { revalidate: 86400 } },
    );
    if (!response.ok) return null;
    const html = await response.text();

    // Each day's count lives in a tooltip that points at the day's cell id.
    const counts = new Map<string, number>();
    for (const [, id, text] of html.matchAll(
      /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g,
    )) {
      const count = text.match(/^([\d,]+) contribution/)?.[1];
      counts.set(id, count ? Number(count.replaceAll(",", "")) : 0);
    }

    const days: ContributionDay[] = [];
    for (const [tag] of html.matchAll(
      /<td[^>]*ContributionCalendar-day[^>]*>/g,
    )) {
      const date = attribute(tag, "data-date");
      const level = attribute(tag, "data-level");
      const id = attribute(tag, "id");
      if (!date || !level) continue;
      days.push({
        date,
        level: Number(level),
        count: (id && counts.get(id)) || 0,
      });
    }
    if (days.length === 0) return null;
    days.sort((a, b) => a.date.localeCompare(b.date));

    return {
      username,
      total: days.reduce((sum, day) => sum + day.count, 0),
      days,
    };
  } catch {
    return null;
  }
}
