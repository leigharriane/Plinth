import { ExperienceTabs } from "@/components/sections/ExperienceTabs";
import { Container } from "@/components/ui/Container";
import siteConfig from "@/site.config";

export function Experience() {
  if (siteConfig.experience.length === 0) return null;

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="pb-section"
    >
      <Container>
        <h2 id="experience-heading" className="sr-only">
          Experience
        </h2>
        <ExperienceTabs jobs={siteConfig.experience} />
      </Container>
    </section>
  );
}
