import { ProjectCard } from "@/components/sections/ProjectCard";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Container";
import siteConfig from "@/site.config";

export function Works() {
  if (siteConfig.projects.length === 0) return null;

  return (
    <section id="works" aria-labelledby="works-heading" className="py-section">
      <Container>
        <h2 id="works-heading" className="text-center text-h2 font-semibold">
          Recent Works
        </h2>
      </Container>

      <Carousel label="Projects" className="mt-carousel">
        {siteConfig.projects.map((project, index) => (
          <ProjectCard key={index} project={project} eager={index === 0} />
        ))}
      </Carousel>
    </section>
  );
}
