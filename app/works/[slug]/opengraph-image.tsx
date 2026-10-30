import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { caseStudies, findCaseStudy } from "@/lib/case-studies";
import { staticColors } from "@/lib/static-colors";
import siteConfig from "@/site.config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((project) => ({ slug: project.caseStudy.slug }));
}

export const alt = "Case study";
const colors = { ...staticColors.dark, accent: staticColors.accent };

/** One social image per case study: the title, the category and the author's name. */
export default async function CaseStudyImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = findCaseStudy((await params).slug);
  const font = await readFile(
    join(process.cwd(), "app/fonts/AlbertSans-SemiBold.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: colors.bg,
        color: colors.fg,
        fontFamily: "Albert Sans",
        fontWeight: 600,
      }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "flex-start",
          padding: "10px 24px",
          borderRadius: 999,
          backgroundColor: colors.accent,
          fontSize: 28,
        }}
      >
        {project?.category ?? "Case study"}
      </div>
      <div style={{ fontSize: 84, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
        {project?.title ?? siteConfig.name}
      </div>
      <div style={{ display: "flex", fontSize: 32, color: "#a5a5a5" }}>
        {siteConfig.name} · Case study
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Albert Sans", data: font, weight: 600, style: "normal" },
      ],
    },
  );
}
