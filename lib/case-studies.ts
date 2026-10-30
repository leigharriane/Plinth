import type { CaseStudy, Project } from "@/lib/config";
import siteConfig from "@/site.config";

export type ProjectWithCaseStudy = Project & { caseStudy: CaseStudy };

/** Every project that has a case study, in config order. */
export const caseStudies = siteConfig.projects.filter(
  (project): project is ProjectWithCaseStudy => Boolean(project.caseStudy),
);

export const findCaseStudy = (slug: string) =>
  caseStudies.find((project) => project.caseStudy.slug === slug);
