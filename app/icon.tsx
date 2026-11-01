import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { initials } from "@/lib/initials";
import { staticColors } from "@/lib/static-colors";
import siteConfig from "@/plinth.config";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// `icon` from the config, else the initials, e.g. "David Parker" → "dp". Lowercase, like a
// shell username, so the block cursor after them reads as a prompt.
const mark = (siteConfig.icon ?? initials(siteConfig.name))
  .trim()
  .slice(0, 2)
  .toLowerCase();

/** Favicon: the initials and a block cursor on the accent color, like a terminal prompt. */
export default async function Icon() {
  // The site's font, bundled as in opengraph-image.tsx; without it next/og falls back to its own.
  const font = await readFile(
    join(process.cwd(), "app/fonts/AlbertSans-SemiBold.ttf"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        borderRadius: 16,
        backgroundColor: staticColors.accent,
        color: staticColors.dark.fg,
        fontSize: 30,
        fontFamily: "Albert Sans",
        fontWeight: 600,
        letterSpacing: -1,
      }}
    >
      <span>{mark}</span>
      {/* The cursor: a block as tall as the lowercase letters, sitting on the baseline. */}
      <div
        style={{
          width: 11,
          height: 22,
          marginTop: 2,
          backgroundColor: staticColors.dark.fg,
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        { name: "Albert Sans", data: font, weight: 600, style: "normal" },
      ],
    },
  );
}
