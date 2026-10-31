import { cn } from "@/lib/cn";
import type { Contributions } from "@/lib/github-contributions";
import type { RecentRepo } from "@/lib/github-repos";

/** A surface card with a small caps heading, sized to sit in a row with the others. */
export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-card border border-border-subtle bg-surface p-6">
      <h3 className="text-tag font-semibold tracking-wide text-fg-muted uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * GitHub's 0–4 levels as fills, set once on the parent for every child's data-level, so
 * each of the ~280 cells is a bare span. The accent is only 2.51:1 on the dark card, so
 * dark mode starts the steps higher, and keeps the empty fill faint enough to sit below
 * level 1.
 */
const levelFills = cn(
  "*:data-[level=0]:bg-fg/8 *:data-[level=1]:bg-accent/25 *:data-[level=2]:bg-accent/50 *:data-[level=3]:bg-accent/75 *:data-[level=4]:bg-accent",
  "dark:*:data-[level=0]:bg-fg/6 dark:*:data-[level=1]:bg-accent/40 dark:*:data-[level=2]:bg-accent/60 dark:*:data-[level=3]:bg-accent/80",
);
const levels = [0, 1, 2, 3, 4];

/** Contributions, one column per week, Sunday at the top like GitHub's. */
export function ContributionGraph({
  data,
  compact = false,
  months,
}: {
  data: Contributions;
  /** Styled to sit in a row of cards: a heading, their padding and a smaller caption. */
  compact?: boolean;
  /** Show only the last few months instead of the whole year. */
  months?: number;
}) {
  const { username } = data;
  let days = data.days;
  if (months) {
    // Back from the latest day, then on to that week's Sunday so the first column is full.
    const start = new Date(`${days.at(-1)!.date}T00:00:00Z`);
    start.setUTCMonth(start.getUTCMonth() - months);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const from = start.toISOString().slice(0, 10);
    days = days.filter((day) => day.date >= from);
  }
  const total = days.reduce((sum, day) => sum + day.count, 0);
  // Blank cells before the first day, so each column starts on a Sunday.
  const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const weeks = Math.ceil((offset + days.length) / 7);
  const summary = `${total.toLocaleString("en-US")} contributions in the last ${months ? `${months} months` : "year"}`;

  return (
    <figure
      className={cn(
        "flex flex-col rounded-card border border-border-subtle bg-surface",
        // Compact sits beside other cards, so it takes their padding and heading.
        compact ? "gap-5 p-6" : "gap-4 p-4 sm:p-6",
      )}
    >
      {compact && (
        <h3 className="text-tag font-semibold tracking-wide text-fg-muted uppercase">
          Contributions
        </h3>
      )}
      <div
        role="img"
        aria-label={`GitHub contribution graph: ${summary}`}
        className={cn(
          "grid grid-flow-col grid-rows-7 gap-[clamp(1px,0.3vw,3px)] *:aspect-square *:rounded-[min(3px,20%)]",
          levelFills,
        )}
        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: offset }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => (
          <span
            key={day.date}
            data-level={levels.includes(day.level) ? day.level : 0}
          />
        ))}
      </div>
      <figcaption
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 font-normal text-fg-muted",
          // Pinned to the bottom when a taller card beside it stretches this one.
          compact ? "mt-auto text-tag" : "text-meta",
        )}
      >
        <span>
          {summary}{" "}
          {/* Keeps the separator with the handle when the line wraps. */}
          <span className="whitespace-nowrap">
            |{" "}
            {/* Underlined, as the color alone barely sets it apart in dark mode. The padding
                grows the tap target to 44px; the negative margin keeps it off the line height. */}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-marker -my-3.5 inline-flex py-3.5 font-medium text-fg underline decoration-border underline-offset-4"
            >
              <span>@{username}</span>
              <span className="sr-only"> on GitHub (opens in a new tab)</span>
            </a>
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "flex items-center gap-1 *:rounded-[3px]",
            compact ? "*:size-2.5" : "*:size-3",
            levelFills,
          )}
        >
          Less
          {levels.map((level) => (
            <span key={level} data-level={level} />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  );
}

/** Repo names linking to GitHub, each with its description, language and last push. */
export function RecentRepoList({ repos }: { repos: RecentRepo[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {repos.map((repo) => (
        <li key={repo.name} className="flex flex-col gap-1">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            // Block, not flex, so the name stays inline and a wrapped name gets the marker on
            // every line. The padding makes one line 44px tall.
            className="link-marker block py-[calc((2.75rem-1lh)/2)] text-body font-semibold break-words"
          >
            <span className="box-decoration-clone">{repo.name}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {repo.description && (
            <p className="line-clamp-2 text-meta font-normal text-fg-muted">
              {repo.description}
            </p>
          )}
          <p className="text-meta font-normal text-fg-muted">
            {[
              repo.language,
              new Date(repo.pushedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
