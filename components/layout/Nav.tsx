import { Container } from "@/components/ui/Container";
import { caseStudies } from "@/lib/case-studies";
import { cn } from "@/lib/cn";
import type { CommandPaletteData } from "@/lib/command-palette";
import { iconSize } from "@/lib/icons";
import { paletteProjects } from "@/lib/palette-projects";
import { socialPlatforms } from "@/lib/social-icons";
import { terminalData } from "@/lib/terminal-data";
import siteConfig from "@/site.config";
import { CommandPalette } from "./CommandPalette";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { NavTrail } from "./NavTrail";
import { SectionLink } from "./SectionLink";
import { ThemeToggle } from "./ThemeToggle";

const hasWorks = siteConfig.projects.length > 0;

const caseStudyTitles = Object.fromEntries(
  caseStudies.map((project) => [
    `/works/${project.caseStudy.slug}`,
    project.title,
  ]),
);

// Only what the palette shows, with each configured mark rendered here, so the browser
// gets those few SVGs as markup instead of the whole icon set as code.
const paletteData: CommandPaletteData = {
  email: siteConfig.email,
  resume: siteConfig.resume,
  hasWorks,
  hasExperience: siteConfig.experience.length > 0,
  socials: siteConfig.socials
    .filter((social) => social.platform !== "email")
    .map((social) => {
      const { name, Icon, iconClassName } = socialPlatforms[social.platform];
      return {
        id: `social-${social.platform}-${social.url}`,
        label: social.label ?? name,
        url: social.url,
        icon: (
          <Icon
            aria-hidden
            className={iconClassName ?? cn(iconSize.brand, "shrink-0")}
          />
        ),
      };
    }),
  projects: paletteProjects,
  terminal: terminalData,
};

export function Nav() {
  return (
    // Solid while the phone menu is open, so the strip above its panel isn't see-through.
    <header className="print-hidden sticky top-0 z-50 h-16 has-[[data-menu-open]]:bg-bg">
      {/* No bar: the page blurs and fades as it slides under. See .soft-edge in globals.css. */}
      <div aria-hidden className="soft-edge">
        <div />
        <div />
        <div />
        <div />
      </div>
      <div
        aria-hidden
        className="reading-progress absolute inset-x-0 top-0 h-0.5"
      >
        <div className="h-full bg-ring" />
      </div>

      {/* From md the two sides share the leftover width equally, so the links sit at the
          true center and a case study's title in the trail can't push them over. */}
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:basis-0">
          <SectionLink
            href="#home"
            className="inline-flex min-h-11 shrink-0 items-center text-brand font-semibold"
          >
            {siteConfig.name}
          </SectionLink>
          <NavTrail titles={caseStudyTitles} />
        </div>

        <NavLinks hasWorks={hasWorks} />

        <div className="-mr-2.5 flex shrink-0 items-center justify-end gap-1 md:flex-1 md:basis-0">
          <CommandPalette data={paletteData} />
          <ThemeToggle />
          <MobileMenu hasWorks={hasWorks} />
        </div>
      </Container>
    </header>
  );
}
