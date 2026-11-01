"use client";

import { useEffect } from "react";

// Strict Mode runs effects twice in development. Once is enough.
let printed = false;

/**
 * One line in the browser console for whoever opens devtools, which on a developer's
 * portfolio is most visitors. Renders nothing.
 */
export function Signature({ line }: { line: string }) {
  useEffect(() => {
    if (printed) return;
    printed = true;
    console.info(line);
  }, [line]);
  return null;
}
