import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { staticColors } from "@/lib/static-colors";
import siteConfig from "@/site.config";

export const alt = `${siteConfig.name} | ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The dark theme, as in the Figma frame.
const colors = { ...staticColors.dark, accent: staticColors.accent };

export default async function OpengraphImage() {
  const { name, hero, skills } = siteConfig;
  const lines = [hero.greeting, name, hero.tagline];
  const band = skills.join(" | ");
  // Bundled as TTF (next/og can't read woff2) so the build never needs the network.
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
        backgroundColor: colors.bg,
        color: colors.fg,
        fontFamily: "Albert Sans",
        fontWeight: 600,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 72,
          lineHeight: 1.2,
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Centered behind the text, where the glow rests on the site. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: "50%",
              // Satori lacks `closest-side`; fade to a transparent accent so the edge stays blue.
              backgroundImage: `radial-gradient(circle, ${colors.accent} 0%, ${colors.accent}00 70%)`,
            }}
          />
        </div>
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "16px 40px",
          backgroundColor: colors.accent,
          fontSize: 40,
          letterSpacing: "-0.06em",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {band}
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
