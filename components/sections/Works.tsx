import { ProjectCard } from "@/components/sections/ProjectCard";
import { Carousel } from "@/components/ui/Carousel";
import siteConfig from "@/site.config";

export function Works() {
  if (siteConfig.projects.length === 0) return null;

  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      data-reveal
      className="py-section"
    >
      {/* Left-aligned to match the About and Experience labels. */}
      <Carousel
        label="Projects"
        header={
          <h2 id="works-heading" className="reveal text-h2 font-semibold">
            Recent work
          </h2>
        }
        listClassName="reveal-items [--i:1]"
      >
        {siteConfig.projects.map((project, index) => (
          <ProjectCard key={index} project={project} eager={index === 0} />
        ))}
      </Carousel>
    </section>
  );
}
