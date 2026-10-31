// SVGs and remote URLs skip the image optimizer, so any path or URL works without
// extra next.config setup.
export const skipOptimizer = (src: string) =>
  src.endsWith(".svg") || /^https?:\/\//.test(src);

// The project card's width. The hero peek shows the same screenshots smaller but uses this
// too, so the browser picks the same file for both and downloads it once.
export const projectImageSizes = "(min-width: 48rem) 360px, 80vw";
