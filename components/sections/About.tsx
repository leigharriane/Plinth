import { CurrentYear } from "@/components/ui/CurrentYear";
import siteConfig from "@/site.config";

export function About() {
  const { paragraphs, label, headline, year } = siteConfig.about;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="grid lg:grid-cols-2"
    >
      {/* First in the DOM so the heading leads; on desktop it moves to the right half. */}
      <div className="flex flex-col items-center justify-center gap-6 bg-accent px-gutter py-section text-center text-on-accent">
        <h2 id="about-heading" className="text-title font-semibold">
          {label}
        </h2>
        {/* Figma's 6px centre stroke is masked to the inside, so 3px shows. */}
        <div className="grid aspect-[548/383.5] w-full max-w-[24rem] place-items-center rounded-[50%] border-3 border-on-accent">
          <p className="max-w-[5.3em] text-display-about font-semibold break-words">
            {headline}
          </p>
        </div>
        <p className="text-title font-semibold">
          {year ?? <CurrentYear buildYear={new Date().getFullYear()} />}
        </p>
      </div>

      {/* On desktop the text starts on the page container line. Padding percentages resolve
          against this half, not the page, so the carousel's inset of (100% - page) / 2
          becomes 100% - page / 2. */}
      <div className="flex items-center justify-center px-gutter py-section lg:order-first lg:justify-start lg:pl-[max(var(--spacing-gutter),calc(100%-var(--container-page)/2+var(--spacing-gutter)))]">
        <div className="max-w-[34rem] space-y-[1em] text-lead font-normal text-fg-muted">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
