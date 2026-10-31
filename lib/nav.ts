/**
 * In-page links shared by the header and footer. Each href matches a section id, in the
 * order the sections appear on the page.
 */
export const navLinks = [
  { label: "Work", href: "#works" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

/** The links to show. Work drops out with no projects, since its section does too. */
export const visibleNavLinks = (hasWorks: boolean) =>
  navLinks.filter((link) => hasWorks || link.href !== "#works");

/**
 * Sections that live in the footer, so every page has them and links scroll in place
 * instead of going to the home page first.
 */
export const onEveryPage = (hash: string) => hash === "contact";

/** Every section the nav can mark as current, including ones without a link. */
export const sectionIds = [
  ...navLinks.map((link) => link.href.slice(1)),
  "experience",
];

/**
 * The sections the palette and terminal can jump to, in page order: the nav's links,
 * with Experience in its place between About and Contact.
 */
export const pageSections = (hasWorks: boolean, hasExperience: boolean) =>
  visibleNavLinks(hasWorks).flatMap((link) => {
    const section = { label: link.label, hash: link.href.slice(1) };
    return section.hash === "contact" && hasExperience
      ? [{ label: "Experience", hash: "experience" }, section]
      : [section];
  });
