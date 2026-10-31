import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ShortcutHint } from "@/components/ui/ShortcutHint";
import siteConfig from "@/site.config";

// Next adds the noindex robots tag to 404s on its own.
export const metadata: Metadata = {
  title: `Page not found | ${siteConfig.name}`,
};

/** Shown for any unknown URL and wherever a page calls notFound(). */
export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-8 py-section text-center">
      <h1 className="text-h1 font-semibold text-balance">Page not found</h1>
      <p className="max-w-[33em] text-lead/normal font-normal text-fg-muted">
        This page doesn’t exist or has moved.
      </p>

      <div className="flex flex-wrap justify-center gap-2.5">
        <ButtonLink href="/">Back to home</ButtonLink>
        {/* Works only renders with projects, so there'd be nothing to see. */}
        {siteConfig.projects.length > 0 && (
          <ButtonLink section="#works" variant="outline">
            See my work
          </ButtonLink>
        )}
      </div>

      <ShortcutHint lead="Or press" />
    </Container>
  );
}
