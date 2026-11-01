import { Cta } from "@/components/sections/Cta";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { LocalTime } from "@/components/ui/LocalTime";
import { visibleNavLinks } from "@/lib/nav";
import { timeZone, timeZonePlace } from "@/lib/time-zone";
import { SectionLink } from "./SectionLink";
import siteConfig from "@/plinth.config";

export function Footer() {
  return (
    <footer className="print-hidden border-t border-border">
      <Cta />
      <div className="border-t border-border">
        <Container className="flex flex-col items-center gap-2 py-6 md:flex-row md:justify-between md:py-4">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-10">
              {/* Not Contact: it's the section right above. */}
              {visibleNavLinks(siteConfig.projects.length > 0)
                .filter((link) => link.href !== "#contact")
                .map((link) => (
                  <li key={link.href}>
                    <SectionLink
                      href={link.href}
                      className="link-marker inline-flex min-h-11 min-w-11 items-center justify-center text-meta font-normal"
                    >
                      <span>{link.label}</span>
                    </SectionLink>
                  </li>
                ))}
            </ul>
          </nav>
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
            {timeZone && timeZonePlace && (
              <LocalTime
                timeZone={timeZone}
                place={timeZonePlace}
                className="text-meta font-normal text-fg-muted tabular-nums"
              />
            )}
            <p className="text-center text-meta font-medium">
              © <CurrentYear buildYear={new Date().getFullYear()} />{" "}
              {siteConfig.name}. All Rights Reserved. | Built with{" "}
              {/* Underlined so it reads as a link without color (WCAG 1.4.1). The padding
                  grows the tap target to 44px; the negative margin keeps it off the line height. */}
              <a
                href="https://github.com/leigharriane/Plinth"
                className="link-marker -my-3.5 inline-flex py-3.5 underline decoration-border underline-offset-4"
              >
                <span>Plinth by Leigh Arriane</span>
              </a>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
