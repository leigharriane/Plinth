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
              <pre
                key={index}
                className="overflow-x-auto rounded-card bg-surface p-5 text-body/relaxed text-fg"
              >
                <code>{block.text}</code>
              </pre>
            );
        }
      })}
    </div>
  );
}
