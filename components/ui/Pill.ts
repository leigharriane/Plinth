/**
 * Pill styles shared by the project cards and the case study pages, so a category or a tag
 * looks the same wherever it shows up. Put them on a span or an li.
 */
export const pill = {
  /** A project's category. The transparent border keeps it the same height as a tag. */
  category:
    "rounded-lg border border-transparent bg-accent/10 px-2.5 py-0.5 text-tag font-normal text-fg dark:bg-accent/35",
  /** One tech tag. The border gives it an edge on the dark bg, where a fill barely shows. */
  tag: "rounded-full border border-border-subtle px-2.5 py-0.5 text-tag font-normal wrap-anywhere text-fg-muted",
} as const;
