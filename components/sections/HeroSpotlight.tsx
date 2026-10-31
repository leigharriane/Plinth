import { cn } from "@/lib/cn";

/*
  The hero glow, following the mouse anywhere across the heading. It needs a PointerStage
  around the hero: the band below is marked `data-pointer`, so it gets --pointer-dx/dy from
  its own center and the glow sits right under the cursor. With no mouse or with reduced
  motion those stay unset, and the glow rests centered behind the heading. It's the same
  size as the still glow: 71% of the heading's width, capped at 431px.

  The outer span covers the heading exactly and is a size container, so cqw is the heading's
  width. The band inside is centered on the heading and as wide as the viewport, so the glow
  can reach either edge of the hero. It runs half a glow past the heading at both ends, and
  its mask does the contrast work: soft at the top so it never meets the sticky nav in a hard
  line, and gone 1.5rem under the heading so the intro's muted text never sits on the glow
  (gap-8 puts it 2rem below).
*/

export function HeroSpotlight({ glowClassName }: { glowClassName: string }) {
  return (
    <span
      aria-hidden
      className="@container-[size] pointer-events-none absolute inset-0 -z-10"
    >
      <span
        data-pointer
        className="absolute left-1/2 w-screen -translate-x-1/2 [--glow:min(71cqw,431px)]"
        style={{
          top: "calc(var(--glow) / -2)",
          bottom: "calc(var(--glow) / -2)",
          maskImage:
            "linear-gradient(to bottom, transparent, black calc(var(--glow) / 2), black calc(100% - var(--glow) / 2 - 2rem), transparent calc(100% - var(--glow) / 2 + 1.5rem))",
        }}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1/2 size-(--glow)",
            glowClassName,
          )}
          style={{
            translate:
              "calc(-50% + var(--pointer-dx, 0px)) calc(-50% + var(--pointer-dy, 0px))",
          }}
        />
      </span>
    </span>
  );
}
