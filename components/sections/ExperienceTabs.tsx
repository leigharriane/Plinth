"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";
import type { Experience } from "@/lib/config";

const jobButton = (active: boolean) =>
  cn(
    "flex w-full items-start gap-3 rounded-card p-4 text-left transition-colors lg:gap-4 lg:px-6 lg:py-3",
    // The accent is 2.55:1 on the dark bg, so dark mode adds a ring to mark the
    // selected job (WCAG 1.4.11).
    active
      ? "bg-accent text-on-accent dark:inset-ring-2 dark:inset-ring-border"
      : "hover:bg-fg/10",
  );

/** The logo, company and role: the tab on wider screens, the accordion header on phones. */
function JobLabel({ job }: { job: Experience }) {
  return (
    <>
      {/* Decorative: the company name sits right next to it. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 56px logo, usually an SVG
          the optimizer skips anyway, isn't worth shipping next/image to the client. */}
      <img
        src={job.logo}
        alt=""
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="size-14 shrink-0 rounded-xl bg-logo-placeholder object-cover lg:size-12"
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-title-sm font-semibold">{job.company}</span>
        <span className="text-body">{job.role}</span>
      </span>
    </>
  );
}

function JobDetails({ job }: { job: Experience }) {
  return (
    <>
      <p className="text-subtitle font-semibold">
        {job.start} - {job.end}
      </p>
      <div className="mt-stack max-w-[38rem] space-y-[1em] text-lead font-normal text-fg-muted">
        {job.description.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}

/**
 * The jobs as WAI-ARIA tabs from md up, and as an accordion on phones, where a panel
 * after the whole tab list would open off screen. Both render and CSS shows one, so
 * neither layout waits on JS or jumps on load, and display: none keeps the other out of
 * the accessibility tree. They share one selection, which carries across the breakpoint.
 */
export function ExperienceTabs({ jobs }: { jobs: Experience[] }) {
  const [selected, setSelected] = useState(0);
  // The accordion can fold its open job away; the tabs always show the selected one.
  const [expanded, setExpanded] = useState(true);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  // What lost focus by being hidden, see onBreakpoint below.
  const stranded = useRef<Element | null>(null);
  // The header just tapped and where it was on screen, see the layout effect below.
  const anchor = useRef<{ index: number; top: number } | null>(null);

  const show = (index: number) => {
    setSelected(index);
    setExpanded(true);
  };

  const select = (index: number) => {
    const next = (index + jobs.length) % jobs.length;
    show(next);
    tabRefs.current[next]?.focus();
  };

  // Tabs with automatic activation: arrow keys, Home and End move between jobs and show
  // each one's details straight away. Only the selected tab is in the tab order.
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

  const toggle = (index: number) => {
    const header = headerRefs.current[index];
    anchor.current = header
      ? { index, top: header.getBoundingClientRect().top }
      : null;
    if (index === selected) setExpanded(!expanded);
    else show(index);
  };

  // Chrome drops focus from an element as CSS hides it, before the media query reports
  // the change, so note what it was. Firefox keeps it as the active element instead.
  const onBlur = (event: FocusEvent) => {
    if (!event.relatedTarget && !event.target.checkVisibility()) {
      stranded.current = event.target;
    }
  };

  // Crossing md hides the layout that holds focus, which would drop it to the page. Move
  // it to the same job's button in the layout now showing. A tab takes focus by being
  // selected, and the accordion opens that job, so both show what the visitor was on.
  const onBreakpoint = useEffectEvent((tabs: boolean) => {
    const focused =
      document.activeElement === document.body
        ? stranded.current
        : document.activeElement;
    stranded.current = null;
    const from = tabs ? accordionRef.current : tabsRef.current;
    if (!focused || !from?.contains(focused)) return;
    const index = (tabs ? headerRefs : tabRefs).current.findIndex(
      (button) => button === focused,
    );
    const job = index === -1 ? selected : index;
    show(job);
    (tabs ? tabRefs : headerRefs).current[job]?.focus();
  });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 48rem)");
    const onChange = () => onBreakpoint(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Opening a job folds the one above it, which would pull the tapped header up the
  // screen, maybe out of view. Scroll by the same amount before paint so it stays put.
  useLayoutEffect(() => {
    const tapped = anchor.current;
    anchor.current = null;
    const header = tapped && headerRefs.current[tapped.index];
    if (!tapped || !header) return;
    window.scrollBy({
      top: header.getBoundingClientRect().top - tapped.top,
      behavior: "instant",
    });
  }, [selected, expanded]);

  return (
    <>
      {/* reveal-items: the tab list, then the open panel, fade in when the section scrolls in. */}
      <div
        ref={tabsRef}
        onBlur={onBlur}
        className="reveal-items hidden gap-10 [--i:1] md:grid md:grid-cols-[minmax(0,541fr)_minmax(0,656fr)] md:gap-x-[10.7%]"
      >
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
                onClick={() => show(index)}
                className={jobButton(active)}
              >
                <JobLabel job={job} />
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
            // The tab list can run much taller than the screen, so the panel follows it down
            // and a click on a lower job shows its details in view. top-24 clears the 64px nav.
            className="md:sticky md:top-24 md:self-start"
          >
            {/* Names the job for sighted visitors. The panel already takes its name from
                the tab, so this would only repeat it to screen readers. */}
            <p
              aria-hidden
              className="mb-2 text-title-sm font-semibold break-words"
            >
              {job.role} | {job.company}
            </p>
            <JobDetails job={job} />
          </div>
        ))}
      </div>

      {/* The accordion: one job open at a time, its details right under its header. */}
      <div
        ref={accordionRef}
        onBlur={onBlur}
        className="reveal-items flex flex-col gap-2 [--i:1] md:hidden"
      >
        {jobs.map((job, index) => {
          const open = expanded && index === selected;
          return (
            <div key={`${job.company}-${job.start}`}>
              <h3>
                <button
                  ref={(element) => {
                    headerRefs.current[index] = element;
                  }}
                  type="button"
                  id={`${baseId}-header-${index}`}
                  aria-expanded={open}
                  aria-controls={`${baseId}-section-${index}`}
                  onClick={() => toggle(index)}
                  className={jobButton(open)}
                >
                  <JobLabel job={job} />
                </button>
              </h3>
              <div
                role="region"
                id={`${baseId}-section-${index}`}
                aria-labelledby={`${baseId}-header-${index}`}
                hidden={!open}
                className="px-4 pt-4 pb-6 motion-safe:animate-[reveal-up_400ms_var(--ease-ios)]"
              >
                <JobDetails job={job} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
