import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/config";
import { iconSize } from "@/lib/icons";
import { skipOptimizer } from "@/lib/image";

/** More tags than this collapse into a "+N" pill, so the footer doesn't turn into a wall. */
const maxTags = 4;

const tagPill =
  "rounded-full border border-border-subtle px-2.5 py-0.5 text-tag font-normal wrap-anywhere text-fg-muted";

// Its ::after stretches over the card (the nearest positioned ancestor), so the whole
// card is one target and one tab stop. The focus ring is drawn on that overlay, inset
// because the carousel's scroll box clips anything outside.
const stretchedLink =
  "decoration-2 underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-card hover:underline focus-visible:after:outline-2 focus-visible:after:-outline-offset-1 focus-visible:after:outline-ring";

// Raised above the title's overlay so it stays its own target. The 44px hit area
// overhangs the row so the icon lines up with the text.
const secondaryLink =
  "relative z-1 -my-2 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-meta font-medium transition-colors hover:bg-fg/10";

type ProjectCardProps = {
  project: Project;
  /** Load the image straight away. On phones the first card is the LCP element. */
  eager?: boolean;
  /** Replaces the carousel sizing (fixed width, scroll snap), e.g. "w-full" in a grid. */
  className?: string;
};

export function ProjectCard({
  project,
  eager = false,
  className,
}: ProjectCardProps) {
  const {
    title,
    description,
    category,
    year,
    tags = [],
    image,
    caseStudy,
    links,
  } = project;
  // The title opens the live site, or the repo when there's no live site. The Code
  // link only shows when the repo is a second destination.
  const href = links?.live ?? links?.github;
  const hrefIsRepo = !links?.live && Boolean(links?.github);
  const codeHref = links?.live ? links.github : undefined;
  const extraTags = tags.length - maxTags;

  return (
    // The hover styles key off the title link, so a card with no links has none, and
    // hovering the raised Code or case study link doesn't trigger them.
    <li
      className={cn(
        "group relative flex flex-col rounded-card border border-border-subtle bg-surface p-2 transition-colors duration-150 ease-out has-[[data-stretched]:hover]:border-border",
        className ?? "w-[min(22.5rem,80vw)] shrink-0 snap-start",
      )}
    >
      {/* The ::after hairline keeps light screenshots from melting into a light card. */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-placeholder after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-fg/8">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 48rem) 360px, 80vw"
          unoptimized={skipOptimizer(image.src)}
          {...(eager && { loading: "eager", fetchPriority: "high" })}
          className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-safe:group-has-[[data-stretched]:hover]:scale-103"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-3 pt-3 pb-3 md:px-4">
        {/* Visually the category row sits above the title; screen readers get the title first. */}
        <div className="flex flex-col-reverse gap-2">
          <h3 className="text-title font-semibold wrap-anywhere">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-stretched
                className={stretchedLink}
              >
                {title}
                <ArrowUpRight
                  aria-hidden
                  className="ml-1 inline size-[0.8em] align-baseline"
                />
                <span className="sr-only">
                  {hrefIsRepo && ", source code on GitHub"} (opens in a new tab)
                </span>
              </a>
            ) : (
              title
            )}
          </h3>
          {/* rounded-lg rather than a full pill, so a long category that wraps keeps its shape. */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-tag font-normal">
            <span className="max-w-full rounded-lg bg-accent/10 px-2.5 py-0.5 wrap-anywhere text-fg dark:bg-accent/35">
              {category}
            </span>
            {year ? (
              <span className="text-fg-muted">
                {/* Flex items are read without a gap, so give screen readers one. */}
                <span className="sr-only">, </span>
                {year}
              </span>
            ) : null}
          </p>
        </div>

        {/* Clamped so one long description doesn't stretch every card in the row. The full
            text stays in the DOM, so screen readers still get all of it. */}
        <p className="line-clamp-3 text-body font-normal wrap-anywhere text-fg-muted">
          {description}
        </p>

        {tags.length > 0 && (
          <ul
            aria-label="Tech used"
            className="mt-auto flex min-w-0 flex-wrap gap-1.5 pt-1"
          >
            {tags.slice(0, maxTags).map((tag, index) => (
              <li key={index} className={tagPill}>
                {tag}
              </li>
            ))}
            {extraTags > 0 && (
              <li className={tagPill}>
                +{extraTags}
                <span className="sr-only"> more</span>
              </li>
            )}
          </ul>
        )}

        {(caseStudy || codeHref) && (
          // The card's last row: case study on the left, Code on the right. Without
          // tags it takes over pinning itself to the bottom.
          <div
            className={cn(
              "-mr-3 flex items-center justify-between gap-4 pt-1",
              tags.length === 0 && "mt-auto",
            )}
          >
            {caseStudy && (
              // Plain text with an accent underline, so it reads as the card's one
              // real link. Raised above the title's overlay like the Code link.
              <Link
                href={`/works/${caseStudy.slug}`}
                className="group/cs relative z-1 -my-2 inline-flex min-h-11 shrink-0 items-center gap-1 text-meta font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:decoration-fg"
              >
                Read case study
                <ArrowRight
                  aria-hidden
                  className="size-4 motion-safe:transition-transform motion-safe:group-hover/cs:translate-x-0.5"
                />
                <span className="sr-only"> for {title}</span>
              </Link>
            )}
            {codeHref && (
              <a
                href={codeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(secondaryLink, "ml-auto")}
              >
                <SiGithub aria-hidden className={iconSize.brand} />
                Code
                <span className="sr-only">
                  {" "}
                  for {title} on GitHub (opens in a new tab)
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
