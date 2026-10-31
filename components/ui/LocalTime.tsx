"use client";

import { useMemo, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const minute = 60_000;

// Ticks on each new minute. Hidden tabs throttle timers, so it also catches up when the
// tab comes back.
function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const schedule = () => {
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      minute - (Date.now() % minute),
    );
  };
  schedule();
  document.addEventListener("visibilitychange", onChange);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const getMinute = () => Math.floor(Date.now() / minute);
const getServerMinute = () => null;

/**
 * The owner's local time, e.g. "3:42 PM in Manila", in the visitor's own clock format. The
 * page is prerendered, when there's no right time to show, so the HTML holds a hidden
 * stand-in of about the same width and the real time fills in after hydration.
 */
export function LocalTime({
  timeZone,
  place,
  className,
}: {
  timeZone: string;
  place: string;
  className?: string;
}) {
  const now = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  const format = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
      }),
    [timeZone],
  );

  return (
    <p className={cn(className, now === null && "invisible")}>
      {now === null ? "12:00 PM" : format.format(now * minute)} in {place}
    </p>
  );
}
