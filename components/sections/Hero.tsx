import { ArrowRight, CloudDownload, FileText } from "lucide-react";
import { HeroPeek } from "@/components/sections/HeroPeek";
import { HeroSpotlight } from "@/components/sections/HeroSpotlight";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PointerStage } from "@/components/ui/PointerStage";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import { cn } from "@/lib/cn";
import siteConfig from "@/plinth.config";

// Full accent only in dark mode, where it reads as light. On the light background it
// reads as a dark stain, and the heading over its middle drops to about 2.5:1, so light
// mode gets a pale tint of it instead. The tint is the accent made see-through rather than
// mixed with the background, since an oklab mix drifts toward sky blue.
const glowClassName =
  "rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_22%,transparent),transparent)] blur-glow dark:bg-[radial-gradient(closest-side,var(--color-accent),transparent)]";

export function Hero() {
  const { name, email, resume, hero } = siteConfig;
  const glow = hero.glow ?? "pointer";
  const peek = (hero.peek ?? true) && siteConfig.projects.length > 0;
  // Only the spotlight needs the mouse, so the other glows keep a plain server-rendered section.
  const Section = glow === "pointer" ? PointerStage : "section";

  return (
    <Section
      id="home"
      aria-labelledby="hero-heading"
      className="isolate overflow-x-clip"
    >
      {/* With the peek, the fan's bottom edge is the hero's, so it tucks under the skills band. */}
      <Container
        className={cn(
          "flex flex-col items-center gap-8 pt-section text-center",
          peek ? "pb-0" : "pb-section",
        )}
      >
        <h1
          id="hero-heading"
          className="relative text-h1 font-semibold text-balance"
        >
          {/*
            Soft glow from Figma "Ellipse 4": a 431px accent radial gradient with a 70 layer
            blur (CSS blur 35px). Sized and placed relative to the heading so it scales with it.
            Its top fades out so it never meets the translucent sticky nav in a hard line, and
            its bottom fades out before the intro, whose muted text drops below 4.5:1 on the
            light-mode glow. The still glow's wrapper pads 70px so the mask doesn't clip the
            blur. The spotlight rests centered instead and brings its own band and mask.
          */}
          {glow === "pointer" && (
            <HeroSpotlight glowClassName={glowClassName} />
          )}
          {glow === "static" && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-[62%] left-[-9.8%] -z-10 box-content grid aspect-square w-[min(71%,431px)] -translate-1/2 place-items-center [mask-image:linear-gradient(to_bottom,transparent_20%,black_50%,black_58%,transparent_72%)] p-17.5"
            >
              <span className={cn("size-full", glowClassName)} />
            </span>
          )}
          {/* One block of text with forced breaks, not three block spans, so the whole name
              is a single LCP candidate. The spaces keep the plain text readable ("I am David"). */}
          {hero.greeting} <br aria-hidden />
          {hero.name ?? name} <br aria-hidden />
          {hero.tagline}
        </h1>

        <p className="max-w-[33em] text-lead/normal font-normal text-fg-muted">
          {hero.intro}
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink href={`mailto:${email}`}>
            Let’s talk
            <ArrowRight aria-hidden />
          </ButtonLink>
          {resume === "/resume" ? (
            <ButtonLink href={resume} variant="outline">
              Resume
              <FileText aria-hidden />
            </ButtonLink>
          ) : (
            resume && (
              <ButtonLink href={resume} variant="outline" download>
                Resume
                <CloudDownload aria-hidden />
              </ButtonLink>
            )
          )}
        </div>

        <ShortcutHint />

        {peek && <HeroPeek />}
      </Container>
    </Section>
  );
}
