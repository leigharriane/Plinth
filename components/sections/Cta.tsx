import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { arrowUpRight } from "@/lib/icons";
import siteConfig from "@/plinth.config";

export function Cta() {
  const { email, cta } = siteConfig;

  return (
    // The home page's ScrollReveal plays this, and shows it again if you leave before it plays.
    <section id="contact" aria-labelledby="cta-heading" data-reveal>
      <Container className="reveal-items grid gap-8 py-section lg:grid-cols-2 lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)]">
        <h2
          id="cta-heading"
          className="text-display-cta font-semibold text-balance break-words"
        >
          {cta.heading}
        </h2>

        <div className="flex flex-col gap-6">
          <p className="max-w-[33em] text-lead/normal font-normal text-fg-muted">
            {cta.text}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <ButtonLink href={`mailto:${email}`}>
              {"Let's talk"}
              <ArrowUpRight aria-hidden {...arrowUpRight.inline} />
            </ButtonLink>
            <SocialLinks className="-mx-2" />
          </div>
        </div>
      </Container>
    </section>
  );
}
