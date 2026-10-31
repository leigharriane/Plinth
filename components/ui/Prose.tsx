import type { Block } from "@/lib/config";

/** Renders a case study body. Only the block types in `Block` exist, on purpose. */
export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="max-w-[40rem] space-y-6 text-lead font-normal text-fg-muted">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={index}
                className="pt-4 text-title font-semibold text-fg first:pt-0"
              >
                {block.text}
              </h2>
            );
          case "p":
            return <p key={index}>{block.text}</p>;
          case "quote":
            return (
              <figure
                key={index}
                className="border-l-3 border-accent pl-5 text-fg"
              >
                <blockquote>
                  <p>{block.text}</p>
                </blockquote>
                {block.cite && (
                  <figcaption className="mt-2 text-meta text-fg-muted">
                    {block.cite}
                  </figcaption>
                )}
              </figure>
            );
          case "code":
            return (
              // The ::after fade is as wide as the pre's right padding, so it only covers text
              // while a long line runs under it. Scrolled to the end, or with nothing to
              // scroll, it sits over empty padding. It stops short of the bottom padding,
              // where a classic scrollbar would sit.
              <div
                key={index}
                className="relative after:pointer-events-none after:absolute after:inset-y-5 after:right-px after:w-10 after:bg-linear-to-r after:from-surface/0 after:to-surface"
              >
                {/* Focusable so keyboard users can scroll long lines sideways; Safari doesn't
                    focus scroll containers on its own. */}
                <pre
                  tabIndex={0}
                  role="region"
                  aria-label="Code sample"
                  className="overflow-x-auto rounded-card border border-border-subtle bg-surface py-5 pr-10 pl-5 text-body/relaxed text-fg"
                >
                  <code>{block.text}</code>
                </pre>
              </div>
            );
        }
      })}
    </div>
  );
}
