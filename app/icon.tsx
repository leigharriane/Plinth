import { ImageResponse } from "next/og";
import { staticColors } from "@/lib/static-colors";
import siteConfig from "@/site.config";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Initials from the configured name, e.g. "Juan Dela Cruz" → "JC".
const words = siteConfig.name.trim().split(/\s+/);
const initials = (
  words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0]
).toUpperCase();

/** Favicon: the initials on the accent color, styled like the dark theme's accent band. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        backgroundColor: staticColors.accent,
        color: staticColors.dark.fg,
        fontSize: 30,
        fontWeight: 600,
      }}
    >
      {initials}
    </div>,
    size,
  );
}
