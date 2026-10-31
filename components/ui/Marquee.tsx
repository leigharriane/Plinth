import type { CSSProperties } from "react";
import { MarqueePauseButton } from "@/components/ui/MarqueePauseButton";
import { cn } from "@/lib/cn";

type Tone = "accent" | "plain";

const tones: Record<Tone, { band: string; cap: string; button: string }> = {
  accent: {
    band: "bg-accent text-on-accent",
    cap: "bg-accent before:from-accent",
    // The default ring color is the accent in light mode, which would vanish on this band.
    button: "focus-visible:outline-on-accent",
  },
  plain: {
    band: "bg-bg text-fg",
    cap: "bg-bg before:from-bg",
    button: "",
  },
};

type MarqueeProps = {
  items: string[];
  /** Names the list and the pause button for assistive tech, e.g. "Skills". */
  label: string;
  tone?: Tone;
  reverse?: boolean;
  /** Typography and padding for the band. */
  className?: string;
};

/**
 * Endlessly scrolling text. Screen readers get the items once as a list; the moving
 * copy is hidden from them. It pauses on hover, and a click or tap anywhere on the band
 * toggles a pause that sticks (WCAG 2.2.2). It is replaced by a static, wrapping list
 * when the visitor prefers reduced motion. It renders on the server; only the pause
 * button is a client component.
 */
export function Marquee({
  items,
  label,
  tone = "plain",
  reverse = false,
  className,
}: MarqueeProps) {
  if (items.length === 0) return null;

  const text = `${items.join(" - ")} - `;
  // Repeat short lists so each half of the track stays wider than the viewport. At
  // ~0.45em per character, 200 characters of the smaller marquee size cover ~4000px.
  const repeats = Math.max(1, Math.ceil(200 / text.length));
  const half = Array.from({ length: repeats }, () => text).join("");
  // Constant speed whatever the length; the keyframes live in globals.css.
  const style: CSSProperties = { animationDuration: `${half.length * 0.25}s` };

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        tones[tone].band,
        className,
      )}
    >
      {/* With reduced motion the track is hidden and this list wraps in its place, so
          every item stays visible. */}
      <ul
        aria-label={label}
        className="sr-only motion-reduce:not-sr-only motion-reduce:flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-[0.6em] motion-reduce:px-gutter motion-reduce:text-center"
      >
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <div
        aria-hidden
        style={style}
        // Paused on hover, or while the pause button is pressed.
        className={cn(
          "flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] group-has-[[aria-pressed=true]]:[animation-play-state:paused] motion-reduce:hidden",
          reverse && "[animation-direction:reverse]",
        )}
      >
        <span className="whitespace-pre">{half}</span>
        <span className="whitespace-pre">{half}</span>
      </div>

      <MarqueePauseButton
        label={label}
        className={tones[tone].button}
        capClassName={tones[tone].cap}
      />
    </div>
  );
}
