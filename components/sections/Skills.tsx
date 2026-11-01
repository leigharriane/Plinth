import { Marquee } from "@/components/ui/Marquee";
import siteConfig from "@/plinth.config";

export function Skills() {
  if (siteConfig.skills.length === 0) return null;

  return (
    <section aria-labelledby="skills-heading" data-reveal>
      <h2 id="skills-heading" className="sr-only">
        Skills
      </h2>
      <Marquee
        items={siteConfig.skills}
        label="Skills"
        tone="accent"
        className="reveal py-3 text-marquee-md font-semibold"
      />
    </section>
  );
}
