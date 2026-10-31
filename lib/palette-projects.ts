import type { PaletteProject } from "@/lib/command-palette";
import siteConfig from "@/site.config";

/** The projects as palette rows. Server only, so the config stays out of the browser. */
export const paletteProjects: PaletteProject[] = siteConfig.projects.map(
  (project, index) => {
    const { caseStudy, links } = project;
    const [to, href]: [PaletteProject["to"], string] = caseStudy
      ? ["case-study", `/works/${caseStudy.slug}`]
      : links?.live
        ? ["live", links.live]
        : links?.github
          ? ["code", links.github]
          : ["works", "#works"];
    return {
      // The index, since two projects can share a title.
      id: `project-${index}`,
      title: project.title,
      to,
      href,
      keywords: [
        "project work",
        project.category,
        project.year,
        ...(project.tags ?? []),
      ].join(" "),
    };
  },
);
