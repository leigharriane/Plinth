import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiGithub } from "react-icons/si";
import Link from "next/link";
import { SectionLink } from "@/components/layout/SectionLink";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { Container } from "@/components/ui/Container";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { pill } from "@/components/ui/Pill";
import { Prose } from "@/components/ui/Prose";
import { caseStudies, findCaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/cn";
import { iconSize } from "@/lib/icons";
import { skipOptimizer } from "@/lib/image";
import siteConfig from "@/plinth.config";
import { contentType, size } from "./opengraph-image";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.caseStudy.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const project = findCaseStudy((await params).slug);
  // Browsers get metadata streamed, so an empty object here would beat the 404's title.
  if (!project) notFound();
  const { slug, summary } = project.caseStudy;
  const title = `${project.title} | ${siteConfig.name}`;
  const url = `/works/${slug}`;
  return {
    title,
    description: summary,
    alternates: { canonical: url },
    // Next swaps in these objects whole instead of merging them with the layout's, so they
    // repeat the fields from there that should stay.
    openGraph: {
      type: "article",
      url,
      siteName: siteConfig.name,
      title,
      description: summary,
      // The card from opengraph-image.tsx, listed here only to give it this page's alt.
      // Setting images replaces the file's own entry, so there's still one og:image, and
      // the Twitter card copies it.
      images: [
        {
          url: `${url}/opengraph-image`,
          ...size,
          type: contentType,
          alt: `${project.title}, a case study by ${siteConfig.name}`,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description: summary },
  };
}

const backLink =
  "group inline-flex min-h-11 items-center gap-2 text-ui font-medium decoration-2 underline-offset-6 hover:underline";

const backArrow =
  "size-5 motion-safe:transition-transform motion-safe:group-hover:-translate-x-1";

const nextArrow =
  "size-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-1";

// A box per neighbour, the whole of it one link, like the outcome cards above.
const siblingLink =
  "group flex min-w-0 flex-col gap-2 rounded-card border border-border-subtle bg-surface p-5 transition-colors hover:border-border";

const siblingTitle =
  "text-title font-semibold wrap-anywhere decoration-2 underline-offset-6 group-hover:underline";

const sideLink =
  "inline-flex min-h-11 items-center gap-2 font-medium decoration-2 underline-offset-6 hover:underline";

/** A project's case study, from the `caseStudy` field in plinth.config.ts. */
export default async function CaseStudyPage({ params }: { params: Params }) {
  const project = findCaseStudy((await params).slug);
  if (!project) notFound();
  const { title, category, image, links, caseStudy } = project;
  // Left out, the case study reuses the card image; `false` opts out of one.
  const lead = caseStudy.image ?? image;
  // The case studies either side, wrapping round at the ends. With only two, both would
  // be the same one, so it's just "Next".
  const count = caseStudies.length;
  const index = caseStudies.indexOf(project);
  const next = count > 1 ? caseStudies[(index + 1) % count] : undefined;
  const previous =
    count > 2 ? caseStudies[(index - 1 + count) % count] : undefined;
  // Up to three other projects, case study or not, picking up after this one in config order.
  const at = siteConfig.projects.indexOf(project);
  const moreWork = [
    ...siteConfig.projects.slice(at + 1),
    ...siteConfig.projects.slice(0, at),
  ].slice(0, 3);
  const backToWorks = (
    <SectionLink href="#works" className={backLink}>
      <ArrowLeft aria-hidden className={backArrow} />
      Back to projects
    </SectionLink>
  );

  return (
    <>
      {/* data-story points the nav's reading line at this article, so it ends with the
          story and the links below don't count. See .reading-progress. */}
      <article data-story>
        <Container className="flex flex-col gap-10 pt-section">
          <SectionLink href="#works" className={cn(backLink, "self-start")}>
            <ArrowLeft aria-hidden className={backArrow} />
            Back to projects
          </SectionLink>

          <header className="flex flex-col gap-5">
            <span className={cn(pill.category, "self-start")}>{category}</span>
            <h1 data-page-title className="text-h1 font-semibold text-balance">
              {title}
            </h1>
            <p className="max-w-[40rem] text-lead/normal font-normal text-fg-muted">
              {caseStudy.summary}
            </p>
          </header>

          {lead && (
            // Capped at 60svh so on a laptop it doesn't fill the screen and push the story far down.
            <div className="relative aspect-[16/10] max-h-[60svh] overflow-hidden rounded-card bg-placeholder">
              <FallbackImage
                src={lead.src}
                alt={lead.alt}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 80rem) 1200px, calc(100vw - 2rem)"
                unoptimized={skipOptimizer(lead.src)}
                // Screenshots lead with their header, so the cap trims the bottom.
                className="object-cover object-top"
              />
            </div>
          )}

          {/* A minmax(0,1fr) track below lg too, so long code lines scroll inside their block. */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
            {/* First in the source so phones reach the facts before the story; at lg it
              moves to the right column. */}
            <aside className="flex flex-col gap-6 text-body lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start">
              <dl className="flex flex-col gap-4">
                <div>
                  <dt className="text-meta font-medium text-fg-muted">Role</dt>
                  <dd className="font-semibold">{caseStudy.role}</dd>
                </div>
                <div>
                  <dt className="text-meta font-medium text-fg-muted">
                    Timeline
                  </dt>
                  <dd className="font-semibold">{caseStudy.timeline}</dd>
                </div>
                {caseStudy.stack.length > 0 && (
                  <div>
                    <dt className="text-meta font-medium text-fg-muted">
                      Tech stack
                    </dt>
                    <dd>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {caseStudy.stack.map((item) => (
                          <li key={item} className={pill.tag}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
              {links && (links.live || links.github) && (
                <ul className="flex flex-col gap-2">
                  {links.live && (
                    <li>
                      <a
                        href={links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={sideLink}
                      >
                        <ArrowUpRight aria-hidden className={iconSize.inline} />
                        Live site
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                  {links.github && (
                    <li>
                      <a
                        href={links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={sideLink}
                      >
                        <SiGithub aria-hidden className={iconSize.brand} />
                        Source on GitHub
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </aside>

            <div className="flex min-w-0 flex-col gap-10 lg:col-start-1 lg:row-start-1">
              {caseStudy.outcomes && caseStudy.outcomes.length > 0 && (
                <dl className="grid gap-6 sm:grid-cols-3">
                  {caseStudy.outcomes.map((outcome) => (
                    <div
                      key={outcome.label}
                      className="flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-5"
                    >
                      {/* Label first for screen readers; order-first shows the value on top. */}
                      <dt className="text-meta font-medium text-fg-muted">
                        {outcome.label}
                      </dt>
                      <dd className="order-first text-h2 font-semibold">
                        {outcome.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <Prose blocks={caseStudy.body} />
            </div>
          </div>
        </Container>
      </article>

      {/* So the story doesn't end in a dead end with the only way out back at the top. */}
      <Container className="flex flex-col gap-16 pt-10 pb-section">
        {next && (
          <nav
            aria-label="Case studies"
            className="grid gap-4 border-t border-border-subtle pt-10 sm:grid-cols-2"
          >
            {previous && (
              <Link
                href={`/works/${previous.caseStudy.slug}`}
                className={siblingLink}
              >
                <span className="inline-flex items-center gap-2 text-meta font-medium text-fg-muted">
                  <ArrowLeft aria-hidden className={backArrow} />
                  Previous case study
                </span>
                <span className={siblingTitle}>{previous.title}</span>
              </Link>
            )}
            {/* Always on the right, so it stays put when there's no previous. */}
            <Link
              href={`/works/${next.caseStudy.slug}`}
              className={cn(
                siblingLink,
                "sm:col-start-2 sm:items-end sm:text-right",
              )}
            >
              <span className="inline-flex items-center gap-2 text-meta font-medium text-fg-muted">
                Next case study
                <ArrowRight aria-hidden className={nextArrow} />
              </span>
              <span className={siblingTitle}>{next.title}</span>
            </Link>
          </nav>
        )}

        {moreWork.length > 0 ? (
          <section
            aria-labelledby="more-work-heading"
            className={cn(
              "flex flex-col gap-6",
              // Without the case study links above, this takes over the dividing line.
              !next && "border-t border-border-subtle pt-10",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
              <h2 id="more-work-heading" className="text-h2 font-semibold">
                More work
              </h2>
              {backToWorks}
            </div>
            {/* `list-style: none` makes WebKit drop list semantics; the role restores them. */}
            <ul
              role="list"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {moreWork.map((other) => (
                <ProjectCard
                  key={siteConfig.projects.indexOf(other)}
                  project={other}
                  className="w-full"
                  sizes="(min-width: 80rem) 390px, (min-width: 64rem) 31vw, (min-width: 40rem) 48vw, 92vw"
                />
              ))}
            </ul>
          </section>
        ) : (
          // The only project, so all that's left is the way back.
          <div className="border-t border-border-subtle pt-10">
            {backToWorks}
          </div>
        )}
      </Container>
    </>
  );
}
