import { Container } from "@/components/ui/Container";
import siteConfig from "@/site.config";
import { CommandPalette } from "./CommandPalette";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 h-16">
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

      <Container className="relative flex h-16 items-center justify-between gap-6">
        <a
          href="#home"
          className="inline-flex min-h-11 items-center text-brand font-semibold"
        >
          {siteConfig.name}
        </a>

        <NavLinks />

        <div className="-mr-2.5 flex items-center gap-1">
          <CommandPalette />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
