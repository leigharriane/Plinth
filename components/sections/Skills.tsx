import { Marquee } from "@/components/ui/Marquee";
import siteConfig from "@/site.config";

export function Skills() {
  if (siteConfig.skills.length === 0) return null;

  return (
    <section aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="sr-only">
        Skills
      </h2>
      <Marquee
        items={siteConfig.skills}
        label="Skills"
        tone="accent"
        className="py-3 text-marquee-md font-semibold"
      />
    </section>
  );
}
