/**
 * The icon scale. Size icons with CSS only and keep lucide's default stroke: lucide's
 * `absoluteStrokeWidth` compensates against the `size` prop, not the CSS size, so pairing
 * it with these classes gives the wrong stroke. `arrowUpRight` below is the one exception.
 */
export const iconSize = {
  /** Inside text buttons. `ButtonLink` already applies this to its icons. */
  inline: "size-5",
  /** Standalone icon buttons and links: lucide icons, 2px stroke. */
  control: "size-6",
  /**
   * Filled brand marks. They fill their box edge to edge, where lucide leaves a 2px margin,
   * so 20px reads the same as a 24px control icon.
   */
  brand: "size-5",
} as const;

/**
 * Optical sizes for lucide's `ArrowUpRight`, the one exception to the scale above. Its ink
 * spans 10 of its 24 units, where `ArrowRight` and most arrows span 14, so it looks a size
 * smaller at the same box. These boxes are 1.4x larger, and `strokeWidth` shrinks by the same
 * ratio so the rendered stroke still matches the icons beside it. Spread one onto the icon.
 */
export const arrowUpRight = {
  /**
   * Inside a `ButtonLink`, like a 20px `ArrowRight`: 28px box, 11.7px ink, 1.67px stroke.
   * `!` beats the button's `[&_svg]:size-5`, and `-m-1` keeps a 20px footprint so the button
   * stays 48px tall.
   */
  inline: { className: "-m-1 size-7!", strokeWidth: 10 / 7 },
  /** Standalone, like a 24px control icon: 34px box, 14.2px ink, 2px stroke. Fits a 44px target. */
  control: { className: "size-8.5", strokeWidth: 24 / 17 },
} as const;
