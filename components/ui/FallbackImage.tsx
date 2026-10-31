"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * next/image that turns invisible if its file fails to load, so the frame's placeholder
 * color shows instead of a broken-image icon. It stays in the DOM, so screen readers
 * still get the alt text. It remembers which `src` failed, so a new one gets a fresh try.
 */
export function FallbackImage({
  alt,
  className,
  onError,
  ...props
}: ImageProps & { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();

  return (
    <Image
      {...props}
      alt={alt}
      onError={(event) => {
        setFailedSrc(props.src);
        onError?.(event);
      }}
      className={cn(className, failedSrc === props.src && "opacity-0")}
    />
  );
}
