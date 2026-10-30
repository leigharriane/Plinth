// SVGs and remote URLs skip the image optimizer, so any path or URL works without
// extra next.config setup.
export const skipOptimizer = (src: string) =>
  src.endsWith(".svg") || /^https?:\/\//.test(src);
