"use client";

import { useEffect, useRef } from "react";

/*
  Parallax nudge for the hero glow. Only this inner span moves; the masked wrapper around it
  stays put, so the glow can never reach below the mask's 72% line and the intro, buttons and
  focus rings keep their measured contrast.

  Travel is a percentage of the glow's own size (about ±48px × ±24px at 1440), so resizing
  needs no handling. The wrapper's side padding in Hero.tsx is widened by TRAVEL_X so the
  moved blur isn't clipped. The time constants give a soft trail while following and a slower,
  calmer return when the pointer leaves.
*/
const TRAVEL_X = 12;
const TRAVEL_Y = 6;
const FOLLOW_MS = 140;
const RETURN_MS = 320;
// Stop once the remaining distance is under 0.1px at the largest glow (431px wide).
const SETTLED = 0.1 / ((TRAVEL_X / 100) * 431);

const clamp = (n: number) => Math.min(1, Math.max(-1, n));

/** Follows the mouse over `hero` and returns a cleanup that puts the glow back at rest. */
function track(glow: HTMLElement, hero: HTMLElement) {
  // Offsets are fractions of the full travel, in [-1, 1].
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let tau = FOLLOW_MS;
  // The latest unread pointer position; the next frame turns it into a target.
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let last = 0;
  let onscreen = true;

  const write = () => {
    glow.style.transform =
      x || y ? `translate(${x * TRAVEL_X}%, ${y * TRAVEL_Y}%)` : "";
  };

  const tick = (now: number) => {
    // Cap the step so a frame after a stall eases instead of jumping.
    const dt = last ? Math.min(now - last, 100) : 1000 / 60;
    last = now;
    if (pointer) {
      const rect = hero.getBoundingClientRect();
      targetX = clamp((pointer.x - rect.left) / (rect.width / 2) - 1);
      targetY = clamp((pointer.y - rect.top) / (rect.height / 2) - 1);
      pointer = null;
    }
    const k = 1 - Math.exp(-dt / tau);
    x += (targetX - x) * k;
    y += (targetY - y) * k;
    const settled =
      Math.abs(targetX - x) < SETTLED && Math.abs(targetY - y) < SETTLED;
    if (settled) {
      x = targetX;
      y = targetY;
    }
    write();
    frame = settled ? 0 : requestAnimationFrame(tick);
    if (settled) last = 0;
  };

  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const rest = () => {
    cancelAnimationFrame(frame);
    frame = last = x = y = targetX = targetY = 0;
    pointer = null;
    write();
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !onscreen) return;
    pointer = { x: event.clientX, y: event.clientY };
    tau = FOLLOW_MS;
    run();
  };

  const onLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !onscreen) return;
    pointer = null;
    targetX = targetY = 0;
    tau = RETURN_MS;
    run();
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) onscreen = entry.isIntersecting;
    if (!onscreen) rest();
  });
  observer.observe(hero);

  const options = { passive: true };
  hero.addEventListener("pointerenter", onMove, options);
  hero.addEventListener("pointermove", onMove, options);
  hero.addEventListener("pointerleave", onLeave, options);
  glow.style.willChange = "transform";

  return () => {
    hero.removeEventListener("pointerenter", onMove);
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
    observer.disconnect();
    rest();
    glow.style.willChange = "";
  };
}

/**
 * The glow's inner span. It renders exactly like the static glow, and starts tracking after
 * mount only for a mouse-like pointer with motion allowed. It listens on the enclosing
 * `<section>` so the whole hero, not just the heading, steers it.
 */
export function HeroGlow({ className }: { className: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const glow = ref.current;
    const hero = glow?.closest("section");
    if (!glow || !hero) return;

    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let stop: (() => void) | undefined;
    const sync = () => {
      stop?.();
      stop = pointer.matches && motion.matches ? track(glow, hero) : undefined;
    };

    sync();
    pointer.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      pointer.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return <span ref={ref} className={className} />;
}
