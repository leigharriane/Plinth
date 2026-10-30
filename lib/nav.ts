/**
 * In-page links shared by the header and footer. Each href matches a section id, in the
 * order the sections appear on the page.
 */
export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Works", href: "#works" },
  { label: "About", href: "#about" },
] as const;

/** Every section the nav can mark as current, including ones without a link. */
export const sectionIds = [
  ...navLinks.map((link) => link.href.slice(1)),
  "experience",
];
