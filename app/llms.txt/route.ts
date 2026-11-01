import { caseStudies } from "@/lib/case-studies";
import { socialPlatforms } from "@/lib/social-icons";
import { siteUrl } from "@/lib/site-url";
import siteConfig from "@/plinth.config";

// Built once at build time, like the sitemap.
export const dynamic = "force-static";

const absolute = (path: string) => new URL(path, siteUrl).href;
const link = (text: string, url: string, note?: string) =>
  `- [${text}](${url})${note ? `: ${note}` : ""}`;

/**
 * A plain Markdown summary for AI assistants and LLM crawlers, following llmstxt.org:
 * who you are, your case studies and other work, and how to reach you.
 */
export function GET() {
  const { name, role, hero, about, experience, projects, socials, resume } =
    siteConfig;
  const lines: string[] = [
    `# ${name}`,
    "",
    `> ${role}. ${siteConfig.seo?.description ?? hero.intro}`,
    "",
    ...about.paragraphs.flatMap((paragraph) => [paragraph, ""]),
  ];

  if (caseStudies.length > 0) {
    lines.push("## Case studies", "");
    for (const { title, caseStudy: study } of caseStudies) {
      lines.push(
        link(
          title,
          absolute(`/works/${study.slug}`),
          `${study.summary} Role: ${study.role}. Timeline: ${study.timeline}.`,
        ),
      );
    }
    lines.push("");
  }

  const otherWork = projects.filter((project) => !project.caseStudy);
  if (otherWork.length > 0) {
    lines.push("## Other projects", "");
    for (const { title, description, links } of otherWork) {
      const url = links?.live ?? links?.github;
      lines.push(
        url ? link(title, url, description) : `- ${title}: ${description}`,
      );
    }
    lines.push("");
  }

  if (experience.length > 0) {
    lines.push("## Experience", "");
    for (const job of experience) {
      lines.push(
        `- ${job.role} at ${job.company} (${job.start} to ${job.end})`,
      );
    }
    lines.push("");
  }

  lines.push("## Contact", "", link("Email", `mailto:${siteConfig.email}`));
  if (resume) lines.push(link("Resume", absolute(resume)));
  for (const { platform, url, label } of socials) {
    if (platform === "email") continue;
    lines.push(link(label ?? socialPlatforms[platform].name, url));
  }
  lines.push(link("Website", siteUrl.href), "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
