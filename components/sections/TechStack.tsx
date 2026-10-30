import { Marquee } from "@/components/ui/Marquee";
import siteConfig from "@/site.config";

export function TechStack() {
  if (siteConfig.techStack.length === 0) return null;

  return (
    <section aria-labelledby="tech-heading" className="py-band">
      <h2 id="tech-heading" className="sr-only">
        Tech stack
      </h2>
      <Marquee
        items={siteConfig.techStack}
        label="Tech stack"
        reverse
        className="py-3 text-marquee-lg font-semibold"
      />
    </section>
  );
}
