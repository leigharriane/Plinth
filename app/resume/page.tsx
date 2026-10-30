import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PrintButton } from "@/components/ui/PrintButton";
import { socialPlatforms } from "@/lib/social-icons";
import siteConfig from "@/site.config";

export const metadata: Metadata = {
  title: `Resume | ${siteConfig.name}`,
  description: `Resume of ${siteConfig.name}, ${siteConfig.role}.`,
  alternates: { canonical: "/resume" },
};

/* Hides the site chrome when printing and keeps the type readable on paper. */
const printStyles = `
@media print {
  header, footer, .print-hidden { display: none !important; }
  body { background: #fff !important; color: #000 !important; }
  .resume-section { break-inside: avoid; }
}
`;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = `resume-${title.toLowerCase()}`;
  return (
    <section
      aria-labelledby={id}
      className="resume-section grid gap-4 border-t border-border pt-6 md:grid-cols-[11rem_1fr] md:gap-8"
    >
      <h2
        id={id}
        className="text-tag font-semibold tracking-wide text-fg-muted uppercase"
      >
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

/**
 * A resume built from site.config.ts, so it never drifts from the site. Print it, or
 * save it as a PDF from the print dialog, to get a file for applications.
 */
export default function ResumePage() {
  const { name, role, email, hero, skills, techStack, experience, socials } =
    siteConfig;
  // Most recent job first.
  const jobs = [...experience].reverse();
  const links = socials.filter((social) => social.platform !== "email");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <article>
        <Container className="flex max-w-[56rem] flex-col gap-8 py-section">
          <div className="print-hidden flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="group inline-flex min-h-11 items-center gap-2 text-ui font-medium decoration-2 underline-offset-6 hover:underline"
            >
              <ArrowLeft
                aria-hidden
                className="size-5 motion-safe:transition-transform motion-safe:group-hover:-translate-x-1"
              />
              Back to the site
            </Link>
            <PrintButton />
          </div>

          <header className="flex flex-col gap-3">
            <h1 className="text-h1 font-semibold">{name}</h1>
            <p className="text-title font-medium text-fg-muted">{role}</p>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-meta font-medium">
              <a
                href={`mailto:${email}`}
                className="decoration-1 underline-offset-4 hover:underline"
              >
                {email}
              </a>
              {links.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="decoration-1 underline-offset-4 hover:underline"
                >
                  {social.label ?? socialPlatforms[social.platform].name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </p>
            <p className="max-w-[40rem] text-body font-normal text-fg-muted">
              {hero.intro}
            </p>
          </header>

          {jobs.length > 0 && (
            <Section title="Experience">
              {jobs.map((job) => (
                <div
                  key={`${job.company}-${job.start}`}
                  className="resume-section flex flex-col gap-1"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-title-sm font-semibold">
                      {job.role}, {job.company}
                    </h3>
                    <p className="text-meta font-medium text-fg-muted">
                      {job.start} to {job.end}
                    </p>
                  </div>
                  <div className="space-y-2 text-body font-normal text-fg-muted">
                    {job.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {(skills.length > 0 || techStack.length > 0) && (
            <Section title="Skills">
              {skills.length > 0 && (
                <p className="text-body font-normal">{skills.join(", ")}</p>
              )}
              {techStack.length > 0 && (
                <p className="text-body font-normal text-fg-muted">
                  {techStack.join(", ")}
                </p>
              )}
            </Section>
          )}
        </Container>
      </article>
    </>
  );
}
