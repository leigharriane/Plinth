import { Cta } from "@/components/sections/Cta";
import { Container } from "@/components/ui/Container";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { navLinks } from "@/lib/nav";
import siteConfig from "@/site.config";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Cta />
      <div className="border-t border-border">
        <Container className="flex flex-col items-center gap-2 py-6 md:flex-row md:justify-between md:py-4">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-10">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-meta font-light decoration-1 underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-center text-meta font-medium">
            © <CurrentYear buildYear={new Date().getFullYear()} />{" "}
            {siteConfig.name}. All Rights Reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
