import "server-only";

/**
 * Identify a file from its container signature rather than its label.
 *
 * The `type` on an uploaded File is derived from the filename by the browser —
 * it is a claim, not a fact. Sniffing the real bytes means a script or binary
 * renamed to `.png` can never be stored under an image content-type, while a
 * genuine image that simply carries the wrong extension (this repo already ships
 * one: `public/assets/404-illustration.png` is really a JPEG) still uploads
 * fine, because we key off what it actually is.
 *
 * Returns the detected MIME type, or `null` when the bytes match nothing known.
 */
export function sniffMimeType(buffer: Buffer): string | null {
  const startsWith = (...sig: number[]) =>
    sig.length <= buffer.length && sig.every((byte, i) => buffer[i] === byte);
  const asciiAt = (offset: number, text: string) =>
    buffer.length >= offset + text.length &&
    buffer.subarray(offset, offset + text.length).toString("latin1") === text;

  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (asciiAt(0, "GIF87a") || asciiAt(0, "GIF89a")) return "image/gif";
  if (asciiAt(0, "RIFF") && asciiAt(8, "WEBP")) return "image/webp";
  // ISO-BMFF (mp4/m4v/mov family): 4-byte box size then the "ftyp" box type.
  if (asciiAt(4, "ftyp")) return "video/mp4";
  // Matroska / WebM EBML header.
  if (startsWith(0x1a, 0x45, 0xdf, 0xa3)) return "video/webm";

  // SVG is text, so there is no signature — look for the root element near the
  // start, past any BOM, XML prolog, doctype or generator comment. Anchoring on
  // `<svg` (not just "looks like XML") keeps an HTML page from passing as SVG.
  const head = buffer.subarray(0, 1024).toString("utf8");
  if (/<svg[\s>]/i.test(head)) return "image/svg+xml";

  return null;
}

/** "image/png" → "image", "video/mp4" → "video". */
export function mimeCategory(mimeType: string): string {
  return mimeType.split("/")[0];
}
