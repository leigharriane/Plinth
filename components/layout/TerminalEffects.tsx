"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { staticColors } from "@/lib/static-colors";
import type { TerminalEffect } from "@/lib/terminal";

/*
 * Here rather than in globals.css, so they only load with the effects. Nothing moves when
 * motion is reduced: the commands don't ask for an effect then, and this is a backstop.
 */
const styles = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes terminal-wobble {
    0%, 100% { rotate: 0deg; }
    20% { rotate: -1.5deg; }
    40% { rotate: 1.25deg; }
    60% { rotate: -0.75deg; }
    80% { rotate: 0.5deg; }
  }
  .terminal-wobble :is(main > *, header, footer, dialog[open]) {
    animation: terminal-wobble 0.9s ease-in-out;
  }
  @keyframes terminal-train {
    from { translate: 100vw 0; }
    to { translate: -100% 0; }
  }
}
`;

/** One of the steam engine's carriages. Drawn for this, not copied from sl. */
const train = [
  "       ( )   (  )",
  "        []",
  "  ______[]________     ______________",
  " |  ____          |===|  [] [] [] [] |",
  " |_|____|_________|   |______________|",
  "    (O)    (O)(O)       (O)      (O)",
];

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rocks the page for under a second, then snaps back. */
function Wobble({ onDone }: { onDone: () => void }) {
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("terminal-wobble");
    const id = setTimeout(() => {
      root.classList.remove("terminal-wobble");
      done();
    }, 1000);
    return () => {
      clearTimeout(id);
      root.classList.remove("terminal-wobble");
    };
  }, []);
  return null;
}

const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789";

/** Green rain over the page for five seconds. Escape stops it sooner. */
function Matrix({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leaving, setLeaving] = useState(false);

  const done = useEffectEvent(onDone);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || reducedMotion()) {
      done();
      return;
    }
    const size = 16;
    let width = 0;
    let height = 0;
    let drops: number[] = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Columns start above the top at different heights, so the rain arrives ragged.
      drops = Array.from(
        { length: Math.ceil(width / size) },
        () => -Math.random() * (height / size),
      );
    };
    resize();

    let frame = 0;
    let last = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      // About 20 steps a second. Faster reads as flicker.
      if (time - last < 50) return;
      last = time;
      context.fillStyle = staticColors.matrix.trail;
      context.fillRect(0, 0, width, height);
      context.fillStyle = staticColors.matrix.glyph;
      context.font = `${size}px ui-monospace, monospace`;
      drops.forEach((row, column) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        context.fillText(glyph, column * size, row * size);
        drops[column] =
          row * size > height && Math.random() > 0.975 ? 0 : row + 1;
      });
    };
    frame = requestAnimationFrame(draw);

    const stop = setTimeout(() => setLeaving(true), 5000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLeaving(true);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stop);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // Fades in and out over half a second, so it never flashes on or off.
      onTransitionEnd={() => leaving && onDone()}
      className={cn(
        "pointer-events-none fixed inset-0 z-100 size-full transition-opacity duration-500 starting:opacity-0",
        leaving ? "opacity-0" : "opacity-90",
      )}
    />
  );
}

/** A small train that crosses the bottom of the screen once. */
function Train({ onDone }: { onDone: () => void }) {
  const done = useEffectEvent(onDone);
  useEffect(() => {
    // Without motion the keyframes don't exist and the animation never ends.
    if (reducedMotion()) return done();
    // Every overlay stops on Escape, like the rain.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") done();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <pre
      aria-hidden
      onAnimationEnd={onDone}
      style={{ animation: "terminal-train 5s linear forwards" }}
      className="pointer-events-none fixed bottom-4 left-0 z-100 font-mono text-tag leading-tight text-fg"
    >
      {train.join("\n")}
    </pre>
  );
}

/**
 * Plays what a terminal command asked for: `rm -rf /` wobbles the page, `matrix` rains
 * and `sl` runs a train. Each ends by itself and calls `onDone`. A new `run` restarts it.
 */
export function TerminalEffects({
  effect,
  onDone,
}: {
  effect: { kind: TerminalEffect; run: number };
  onDone: () => void;
}) {
  return (
    <>
      <style>{styles}</style>
      {effect.kind === "wobble" && <Wobble key={effect.run} onDone={onDone} />}
      {effect.kind === "matrix" && <Matrix key={effect.run} onDone={onDone} />}
      {effect.kind === "train" && <Train key={effect.run} onDone={onDone} />}
    </>
  );
}
