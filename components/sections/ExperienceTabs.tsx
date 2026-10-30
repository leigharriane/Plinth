"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { Experience } from "@/lib/config";
import { skipOptimizer } from "@/lib/image";

/**
 * WAI-ARIA tabs with automatic activation: arrow keys, Home and End move between jobs
 * and show each one's details straight away. Only the selected tab is in the tab order.
 */
export function ExperienceTabs({ jobs }: { jobs: Experience[] }) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + jobs.length) % jobs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const targets: Record<string, number> = {
      ArrowDown: selected + 1,
      ArrowRight: selected + 1,
      ArrowUp: selected - 1,
      ArrowLeft: selected - 1,
      Home: 0,
      End: jobs.length - 1,
    };
    // Leave modified keys alone, e.g. Alt+ArrowLeft is the browser's Back.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!(event.key in targets)) return;
    event.preventDefault();
    select(targets[event.key]);
  };

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,541fr)_minmax(0,656fr)] md:gap-x-[10.7%]">
      <div
        role="tablist"
        aria-label="Experience"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex flex-col gap-2 lg:gap-3"
      >
        {jobs.map((job, index) => {
          const active = index === selected;
          return (
            <button
              key={`${job.company}-${job.start}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              className={cn(
                "flex items-start gap-3 rounded-card p-4 text-left transition-colors lg:gap-4 lg:px-6 lg:py-3",
                // The accent is 2.55:1 on the dark bg, so dark mode adds a ring to mark the
                // selected tab (WCAG 1.4.11).
                active
                  ? "bg-accent text-on-accent dark:inset-ring-2 dark:inset-ring-fg"
                  : "hover:bg-surface",
              )}
            >
              {/* Decorative: the company name sits right next to it. */}
              <Image
                src={job.logo}
                alt=""
                aria-hidden
                width={64}
                height={64}
                unoptimized={skipOptimizer(job.logo)}
                className="size-14 shrink-0 rounded-xl bg-logo-placeholder object-cover lg:size-12"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-title-sm font-semibold">
                  {job.company}
                </span>
                <span className="text-body">{job.role}</span>
              </span>
            </button>
          );
        })}
      </div>

      {jobs.map((job, index) => (
        <div
          key={`${job.company}-${job.start}`}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== selected}
          tabIndex={0}
        >
          <p className="text-subtitle font-semibold">
            {job.start} - {job.end}
          </p>
          <div className="mt-block max-w-[38rem] space-y-[1em] text-lead font-normal text-fg-muted">
            {job.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
