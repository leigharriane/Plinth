import type { Metadata, Viewport } from "next";
import { Albert_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { Signature } from "@/components/layout/Signature";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { plinth } from "@/lib/plinth";
import { plinthVersion } from "@/lib/plinth-version";
import { siteUrl } from "@/lib/site-url";
import { staticColors } from "@/lib/static-colors";
import siteConfig from "@/plinth.config";
import "./globals.css";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-albert-sans",
  display: "swap",
});

const title = `${siteConfig.name} | ${siteConfig.role}`;
const description = siteConfig.seo?.description ?? siteConfig.hero.intro;
const credit = `Built with ${plinth.name} ${plinthVersion} by ${plinth.author} | ${plinth.url}`;

// og:image and twitter:image are added automatically from app/opengraph-image.tsx.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  // Like Astro and Hugo set it: what "what's this built with" tools read.
  generator: `${plinth.name} ${plinthVersion}`,
  authors: [{ name: siteConfig.name, url: siteUrl.href }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.seo?.siteName ?? siteConfig.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: staticColors.light.bg },
    { media: "(prefers-color-scheme: dark)", color: staticColors.dark.bg },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior lets Next turn smooth scrolling off for route changes, so a
    // new page starts at its top (or its #section) at once. Hash links on the page still glide.
    <html
      lang="en"
      className={albertSans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        {/* No disableTransitionOnChange: it restyles the whole page twice on every load.
            Theme changes turn transitions off themselves (suppressTransitions). */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SkipLink />
          <Nav />
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Signature line={credit} />
        </ThemeProvider>
      </body>
    </html>
  );
}
