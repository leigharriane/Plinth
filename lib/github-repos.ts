export type RecentRepo = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  pushedAt: string;
};

type ApiRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

/**
 * The person's latest active repos, newest push first, or null if GitHub can't be
 * reached. Forks and archived repos are left out. It's one request a day to GitHub's REST
 * API, well under the 60 an hour it allows without a token, so it works with no setup. A
 * GITHUB_TOKEN env var is optional: set it if a shared host's IP keeps hitting the limit.
 */
export async function getRecentRepos(
  username: string,
  count = 3,
): Promise<RecentRepo[] | null> {
  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "plinth-portfolio",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        next: { revalidate: 86400 },
      },
    );
    if (!response.ok) return null;
    const repos = (await response.json()) as ApiRepo[];
    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .slice(0, count)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        pushedAt: repo.pushed_at,
      }));
  } catch {
    return null;
  }
}
