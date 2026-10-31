import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { projectImageSizes, skipOptimizer } from "@/lib/image";
import siteConfig from "@/site.config";

/*
 * Poses by project count. Three: the outer two tilt away from the middle one, which sits
 * highest and on top. Two tilt away from each other evenly, so neither looks like the odd
 * one out. One sits upright.
 */
const poses = [
  ["z-1"],
  ["rotate-[-4deg] translate-y-3", "rotate-[4deg] translate-y-3"],
  ["rotate-[-7deg] translate-y-5", "z-1", "rotate-[7deg] translate-y-5"],
];

/**
 * The first three project thumbnails fan up from the bottom of the hero and tuck under the
 * skills band. It's one link down to Works; the full cards there carry the image
 * descriptions, so the thumbnails here are decorative.
 */
export function HeroPeek() {
  const shots = siteConfig.projects.slice(0, 3);
  if (shots.length === 0) return null;

  return (
    <a
      href="#works"
      // max-w-full keeps the fan inside the gutter on phones. The ring sits inside the
      // link, because the skills band paints over anything below it.
      className="group/peek flex max-w-full flex-col items-center gap-3 rounded-card focus-visible:-outline-offset-2"
    >
      <span className="inline-flex min-h-11 items-center gap-1.5 text-meta font-medium text-fg-muted transition-colors group-hover/peek:text-fg">
        See recent work
        <ArrowDown
          aria-hidden
          className="size-4 motion-safe:transition-transform motion-safe:group-hover/peek:translate-y-0.5"
        />
      </span>
      <span
        aria-hidden
        className="flex h-[clamp(5.5rem,11vw,8.5rem)] max-w-full items-start justify-center overflow-hidden px-4 pt-5 md:px-8"
      >
        {shots.map((project, index) => (
          <span
            key={index}
            className={cn(
              "relative -mx-[3%] w-[min(15rem,28vw)] shrink-0",
              poses[shots.length - 1][index],
            )}
          >
            {/* The shadow vanishes on the dark page, so there the edge does the work. */}
            <span className="relative block aspect-[16/10] overflow-hidden rounded-card border border-border-subtle bg-surface shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-safe:group-hover/peek:-translate-y-3 dark:border-fg/25">
              <Image
                src={project.image.src}
                alt=""
                fill
                sizes={projectImageSizes}
                unoptimized={skipOptimizer(project.image.src)}
                // Only the top shows above the band, so crop to the top of the screenshot.
                className="object-cover object-top"
              />
            </span>
          </span>
        ))}
      </span>
    </a>
  );
}
