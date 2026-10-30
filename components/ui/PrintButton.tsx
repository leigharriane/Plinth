"use client";

import { Printer } from "lucide-react";

/** Opens the browser's print dialog, which is also how you save the page as a PDF. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 text-ui font-medium inset-ring inset-ring-fg transition-colors hover:bg-fg/10 print:hidden"
    >
      Print or save as PDF
      <Printer aria-hidden className="size-5" />
    </button>
  );
}
