import { ArrowRight, CloudDownload, Command, FileText } from "lucide-react";
import { HeroGlow } from "@/components/sections/HeroGlow";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import siteConfig from "@/site.config";

const glowClassName =
  "size-full rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)] blur-glow";

export function Hero() {
  const { name, email, resume, hero } = siteConfig;
  const glow = hero.glow ?? "pointer";

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="isolate overflow-x-clip"
    >
      <Container className="flex flex-col items-center gap-8 pt-section pb-section text-center">
        <h1
          id="hero-heading"
          className="relative text-h1 font-semibold text-balance"
        >
          {/*
            Soft glow from Figma "Ellipse 4": a 431px accent radial gradient with a 70 layer
            blur (CSS blur 35px). Sized and placed relative to the heading so it scales with it.
            Its top fades out so it never meets the translucent sticky nav in a hard line, and
            its bottom fades out before the intro, whose muted text drops below 4.5:1 on the
            light-mode glow. The wrapper pads 70px so the mask doesn't clip the blur, plus, at
            the sides, HeroGlow's 12% horizontal travel. Only the inner span moves, so the
            vertical padding and the mask's stops stay fixed.
          */}
          {glow !== "off" && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-[62%] left-[-9.8%] -z-10 box-content grid aspect-square w-[min(71%,431px)] -translate-1/2 place-items-center [mask-image:linear-gradient(to_bottom,transparent_20%,black_50%,black_58%,transparent_72%)] px-[calc(--spacing(17.5)_+_0.12_*_min(71%,431px))] py-17.5"
            >
              {glow === "pointer" ? (
                <HeroGlow className={glowClassName} />
              ) : (
                <span className={glowClassName} />
              )}
            </span>
          )}
          {/* The spaces keep the heading's plain text readable ("I am Juan"). */}
          <span className="block">{hero.greeting}</span>{" "}
          <span className="block">{name}</span>{" "}
          <span className="block">{hero.tagline}</span>
        </h1>

        <p className="max-w-[33em] text-lead/normal font-normal text-fg-muted">
          {hero.intro}
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink href={`mailto:${email}`}>
            Let’s Talk
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

        {/* The shortcut needs a keyboard, so the hint hides on small and touch screens. */}
        <p className="hidden flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-meta font-medium text-fg-muted md:inline-flex pointer-coarse:hidden">
          <Command aria-hidden className="size-4" />
          Press{" "}
          <kbd className="rounded-md bg-surface px-1.5 py-0.5 font-sans text-fg">
            ⌘K
          </kbd>
          or{" "}
          <kbd className="rounded-md bg-surface px-1.5 py-0.5 font-sans text-fg">
            Ctrl K
          </kbd>
          to jump anywhere
        </p>
      </Container>
    </section>
  );
}
