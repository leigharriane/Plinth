"use client";

import { useEffect, useRef, type ComponentProps } from "react";

/*
  A <section> that feeds the mouse position to CSS, so whatever follows the mouse stays plain
  markup and styles. The hero's spotlight glow uses it.

  Each descendant marked `data-pointer` gets --pointer-dx / --pointer-dy: px from its own
  center, eased toward the pointer and unclamped, so a follower can sit right under the
  cursor. They're written only on those elements, never on the section, because a custom
  property restyles everything that inherits it. With no mouse, or with reduced motion,
  nothing is written and everything falls back to its rest values.
*/
const RETURN_MS = 320;
// Fractions of half the element, so under half a pixel on a 1440px wide element.
const SETTLED = 0.0005;

type Target = {
  el: HTMLElement;
  x: number;
  y: number;
  tx: number;
  ty: number;
  left: number;
  top: number;
  halfW: number;
  halfH: number;
};

const ease = (from: number, to: number, k: number) => from + (to - from) * k;

function track(stage: HTMLElement, followMs: number) {
  const targets: Target[] = Array.from(
    stage.querySelectorAll<HTMLElement>("[data-pointer]"),
    (el) => ({
      el,
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      left: 0,
      top: 0,
      halfW: 0,
      halfH: 0,
    }),
  );
  let tau = followMs;
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let last = 0;
  let onscreen = true;
  // Rects are cached so a frame never forces layout. Scrolling, resizing or the mouse coming
  // back in marks them stale, and the next frame reads them once.
  let stale = true;

  const measure = () => {
    for (const t of targets) {
      const rect = t.el.getBoundingClientRect();
      t.left = rect.left;
      t.top = rect.top;
      t.halfW = rect.width / 2;
      t.halfH = rect.height / 2;
    }
    stale = false;
  };

  const write = () => {
    for (const t of targets) {
      t.el.style.setProperty("--pointer-dx", `${t.x * t.halfW}px`);
      t.el.style.setProperty("--pointer-dy", `${t.y * t.halfH}px`);
    }
  };

  const clear = () => {
    for (const { el } of targets) {
      el.style.removeProperty("--pointer-dx");
      el.style.removeProperty("--pointer-dy");
    }
  };

  const tick = (now: number) => {
    // Cap the step so a frame after a stall eases instead of jumping.
    const dt = last ? Math.min(now - last, 100) : 1000 / 60;
    last = now;
    const k = 1 - Math.exp(-dt / tau);
    let settled = true;
    if (stale) measure();

    for (const t of targets) {
      if (pointer && t.halfW && t.halfH) {
        t.tx = (pointer.x - t.left) / t.halfW - 1;
        t.ty = (pointer.y - t.top) / t.halfH - 1;
      }
      t.x = ease(t.x, t.tx, k);
      t.y = ease(t.y, t.ty, k);
      if (Math.abs(t.tx - t.x) < SETTLED && Math.abs(t.ty - t.y) < SETTLED) {
        t.x = t.tx;
        t.y = t.ty;
      } else settled = false;
    }
    pointer = null;

    write();
    frame = settled ? 0 : requestAnimationFrame(tick);
    if (settled) last = 0;
  };

  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const rest = () => {
    cancelAnimationFrame(frame);
    frame = last = 0;
    for (const t of targets) t.x = t.y = t.tx = t.ty = 0;
    pointer = null;
    clear();
  };

  const invalidate = () => {
    stale = true;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !onscreen) return;
    if (event.type === "pointerenter") stale = true;
    pointer = { x: event.clientX, y: event.clientY };
    tau = followMs;
    run();
  };

  const onLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !onscreen) return;
    pointer = null;
    for (const t of targets) t.tx = t.ty = 0;
    tau = RETURN_MS;
    run();
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) onscreen = entry.isIntersecting;
    if (!onscreen) rest();
  });
  observer.observe(stage);
  const resizeObserver = new ResizeObserver(invalidate);
  for (const { el } of targets) resizeObserver.observe(el);

  const options = { passive: true };
  stage.addEventListener("pointerenter", onMove, options);
  stage.addEventListener("pointermove", onMove, options);
  stage.addEventListener("pointerleave", onLeave, options);
  window.addEventListener("scroll", invalidate, options);

  return () => {
    stage.removeEventListener("pointerenter", onMove);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("scroll", invalidate);
    observer.disconnect();
    resizeObserver.disconnect();
    rest();
  };
}

/** `follow` is the easing time constant in ms while tracking. */
export function PointerStage({
  follow = 180,
  ...props
}: ComponentProps<"section"> & { follow?: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;

    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let stop: (() => void) | undefined;
    const sync = () => {
      stop?.();
      stop =
        pointer.matches && motion.matches ? track(stage, follow) : undefined;
    };

    sync();
    pointer.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      pointer.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
      stop?.();
    };
  }, [follow]);

  return <section ref={ref} {...props} />;
}
