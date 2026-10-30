"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();

/**
 * The visitor's current year. The page is prerendered, so the HTML carries the build
 * year; after hydration it switches to the real one, so it never goes stale.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  return useSyncExternalStore(subscribe, getYear, () => buildYear);
}
