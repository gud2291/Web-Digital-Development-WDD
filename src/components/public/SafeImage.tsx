"use client";

import * as React from "react";

/**
 * Plain <img> with a graceful runtime fallback. If the source 404s or fails to
 * decode at runtime (e.g. a Cloudinary URL is deleted/renamed), we swap in a
 * neutral brand-coloured block showing the alt text instead of a broken-image
 * icon. Use for decorative/section images that are NOT next/image-optimised.
 */
export interface SafeImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError"> {
  src: string;
  alt: string;
  /** Optional label shown on the fallback block (defaults to alt). */
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, fallbackLabel, style, className, ...rest }: SafeImageProps) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B4DA8 0%, #2563EB 100%)",
          color: "#DBEAFE",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "center",
          padding: 16,
          ...style,
        }}
      >
        {fallbackLabel ?? alt}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
