import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiGithub } from "react-icons/si";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/config";
import { arrowUpRight, iconSize } from "@/lib/icons";
import { projectImageSizes, skipOptimizer } from "@/lib/image";
import { pill } from "@/components/ui/Pill";

/** More tags than this collapse into a "+N" pill, so the footer doesn't turn into a wall. */
const maxTags = 4;

// Its ::after stretches over the card (the nearest positioned ancestor), so the whole
// card is one target and one tab stop, and hovering anywhere on it sweeps the marker in
// behind the title. The focus ring is drawn on that overlay, inset because the
// carousel's scroll box clips anything outside.
const stretchedLink =
  "link-marker outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:-outline-offset-1 focus-visible:after:outline-ring";

// Raised above the title's overlay so it stays its own target. The 44px hit area
// overhangs the row so the icon lines up with the text.
const secondaryLink =
  "relative z-1 -my-2 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-meta font-medium transition-colors hover:bg-fg/10";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Splits off the title's last character so it and the trailing icon can share a no-wrap
 * span. The icon then never lands on a line by itself, while the rest of the title, even
 * one long unbroken word, can still wrap.
 */
function splitLastCharacter(text: string) {
  const characters = Array.from(
    graphemes.segment(text.trimEnd()),
    ({ segment }) => segment,
  );
  return [characters.slice(0, -1).join(""), characters.at(-1) ?? ""] as const;
}

type ProjectCardProps = {
  project: Project;
  /** Load the image straight away. On phones the first card is the LCP element. */
  eager?: boolean;
  /** Replaces the carousel sizing (fixed width, scroll snap), e.g. "w-full" in a grid. */
  className?: string;
  /** The image's `sizes`, for a layout other than the carousel. */
  sizes?: string;
};

export function ProjectCard({
  project,
  eager = false,
  className,
  sizes = projectImageSizes,
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
  const hiddenTags = tags.slice(maxTags);
  const [titleStart, titleEnd] = splitLastCharacter(title);

  return (
    // The hover styles key off the title link, so a card with no links has none, and
    // hovering the raised Code or case study link doesn't trigger them.
    <li
      className={cn(
        "group relative flex flex-col rounded-card border border-border-subtle bg-surface p-2 transition-colors duration-150 ease-out has-[[data-stretched]:focus-visible]:border-border has-[[data-stretched]:hover]:border-border",
        // From 744px (iPad mini portrait), 42vw shows two whole cards and a peek of the third.
        className ??
          "w-[min(22.5rem,80vw)] shrink-0 snap-start min-[46.5rem]:w-[min(22.5rem,42vw)]",
      )}
    >
      {/* The ::after hairline keeps light screenshots from melting into a light card. */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-placeholder after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-fg/8">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          unoptimized={skipOptimizer(image.src)}
          {...(eager && { loading: "eager", fetchPriority: "high" })}
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 pt-3 pb-3 md:px-4 md:pt-4">
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
                {/* The marker span. --marker-trim (the icon and its margin) stops the
                    highlight at the last letter instead of running under the icon. */}
                <span
                  className={
                    hrefIsRepo
                      ? "[--marker-trim:calc(0.8em+0.375rem)]"
                      : "[--marker-trim:calc(1em+0.125rem)]"
                  }
                >
                  {titleStart}
                  <span className="whitespace-nowrap">
                    {titleEnd}
                    {hrefIsRepo ? (
                      <SiGithub
                        aria-hidden
                        className="ml-1.5 inline size-[0.8em] align-[-0.05em]"
                      />
                    ) : (
                      <ArrowUpRight
                        aria-hidden
                        className={cn(
                          "ml-0.5 inline",
                          arrowUpRight.title.className,
                        )}
                        strokeWidth={arrowUpRight.title.strokeWidth}
                      />
                    )}
                  </span>
                </span>
                <span className="sr-only">
                  {hrefIsRepo && ", source code on GitHub"} (opens in a new tab)
                </span>
              </a>
            ) : (
              title
            )}
          </h3>
          {/* A long category wraps to a second line, so touch screens see all of it, and
              only clamps past that (the full text stays in the DOM and the title tooltip).
              The year sits on the pill's first baseline. The transparent border matches the
              tag pills' height. */}
          <p className="flex items-baseline gap-x-2 text-tag font-normal">
            <span
              title={category}
              className={cn(
                pill.category,
                "line-clamp-2 max-w-full min-w-0 wrap-anywhere",
              )}
            >
              {category}
            </span>
            {year ? (
              <span className="shrink-0 text-fg-muted">
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
          // `list-style: none` makes WebKit drop list semantics; the role restores them.
          <ul
            role="list"
            aria-label="Tech stack"
            className="mt-auto flex min-w-0 flex-wrap gap-1.5"
          >
            {tags.slice(0, maxTags).map((tag, index) => (
              <li key={index} className={pill.tag}>
                {tag}
              </li>
            ))}
            {hiddenTags.length > 0 && (
              <li title={hiddenTags.join(", ")} className={pill.tag}>
                +{hiddenTags.length}
                <span className="sr-only"> more: {hiddenTags.join(", ")}</span>
              </li>
            )}
          </ul>
        )}

        {(caseStudy || codeHref) && (
          // The card's last row: case study on the left, Code on the right. Without
          // tags it takes over pinning itself to the bottom. After tags, the extra 4px
          // keeps the links' overhanging focus rings off the pills. When the row wraps,
          // gap-y-4 is twice the 8px overhang, so the two 44px targets don't overlap.
          <div
            className={cn(
              "-mr-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-4",
              tags.length === 0 ? "mt-auto" : "mt-1",
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
                  className="size-4 motion-safe:transition-transform motion-safe:group-hover/cs:translate-x-1"
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
