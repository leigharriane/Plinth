import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiGithub } from "react-icons/si";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { caseStudies, findCaseStudy } from "@/lib/case-studies";
import { iconSize } from "@/lib/icons";
import { skipOptimizer } from "@/lib/image";
import siteConfig from "@/site.config";

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
  if (!project) return {};
  const { slug, summary } = project.caseStudy;
  return {
    title: `${project.title} | ${siteConfig.name}`,
    description: summary,
    alternates: { canonical: `/works/${slug}` },
  };
}

const sideLink =
  "inline-flex min-h-11 items-center gap-2 font-medium decoration-2 underline-offset-6 hover:underline";

/** A project's case study, from the `caseStudy` field in site.config.ts. */
export default async function CaseStudyPage({ params }: { params: Params }) {
  const project = findCaseStudy((await params).slug);
  if (!project) notFound();
  const { title, category, image, links, caseStudy } = project;

  return (
    <article>
      <Container className="flex flex-col gap-10 py-section">
        <Link
          href="/#works"
          className="group inline-flex min-h-11 items-center gap-2 self-start text-ui font-medium decoration-2 underline-offset-6 hover:underline"
        >
          <ArrowLeft
            aria-hidden
            className="size-5 motion-safe:transition-transform motion-safe:group-hover:-translate-x-1"
          />
          Back to works
        </Link>

        <header className="flex flex-col gap-5">
          <span className="self-start rounded-lg bg-accent/10 px-2.5 py-0.5 text-tag font-normal dark:bg-accent/35">
            {category}
          </span>
          <h1 className="text-h1 font-semibold text-balance">{title}</h1>
          <p className="max-w-[40rem] text-lead/normal font-normal text-fg-muted">
            {caseStudy.summary}
          </p>
        </header>

        <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-placeholder">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 80rem) 1280px, 100vw"
            unoptimized={skipOptimizer(image.src)}
            className="object-cover"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div className="flex flex-col gap-10">
            {caseStudy.outcomes && caseStudy.outcomes.length > 0 && (
              <dl className="grid gap-6 sm:grid-cols-3">
                {caseStudy.outcomes.map((outcome) => (
                  <div
                    key={outcome.label}
                    className="flex flex-col gap-1 rounded-card bg-surface p-5"
                  >
                    <dd className="order-first text-h2 font-semibold">
                      {outcome.value}
                    </dd>
                    <dt className="text-meta font-medium text-fg-muted">
                      {outcome.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}
            <Prose blocks={caseStudy.body} />
          </div>

          <aside className="flex flex-col gap-6 text-body lg:sticky lg:top-24 lg:self-start">
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
                  <dt className="text-meta font-medium text-fg-muted">Stack</dt>
                  <dd>
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {caseStudy.stack.map((item) => (
                        <li
                          key={item}
                          className="rounded-full bg-surface px-3 py-1 text-tag font-medium"
                        >
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
        </div>
      </Container>
    </article>
  );
}
