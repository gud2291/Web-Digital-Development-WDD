import Image, { type ImageProps } from "next/image";
import { cldOptimize, cldBlur } from "@/lib/cloudinary";

type CldImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * next/image wrapper that runs Cloudinary URLs through f_auto,q_auto. For
 * non-Cloudinary sources (incl. local /assets) it falls back to the URL
 * unchanged so the optimizer (next image loader) still does its work.
 *
 * §12.18 — for Cloudinary sources it also supplies a tiny e_blur placeholder so
 * the image blurs up gracefully (next/image fades blur → sharp; no layout shift
 * since width/height or fill are already provided by callers).
 */
export function CldImage({ src, alt, placeholder, blurDataURL, ...rest }: CldImageProps) {
  const blur = blurDataURL ?? cldBlur(src);
  const useBlur = placeholder === "blur" || (!placeholder && !!blur);
  return (
    <Image
      src={cldOptimize(src)}
      alt={alt}
      {...(useBlur && blur ? { placeholder: "blur" as const, blurDataURL: blur } : { placeholder })}
      {...rest}
    />
  );
}
