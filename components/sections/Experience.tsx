import { ExperienceTabs } from "@/components/sections/ExperienceTabs";
import { Container } from "@/components/ui/Container";
import siteConfig from "@/plinth.config";

export function Experience() {
  if (siteConfig.experience.length === 0) return null;

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      data-reveal
      className="pb-section"
    >
      {/* The label matches About's, so the section reads as its own after the tech band. */}
      <Container className="flex flex-col gap-stack">
        <h2
          id="experience-heading"
          className="reveal text-tag font-semibold tracking-wide text-fg-muted uppercase"
        >
          Experience
        </h2>
        <ExperienceTabs jobs={siteConfig.experience} />
      </Container>
    </section>
  );
}
