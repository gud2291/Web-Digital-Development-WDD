/* eslint-disable no-console */
/**
 * §17.1 / §17.2 — generate the full favicon / app-icon set + a white brand logo,
 * all derived from public/assets/logo.png via sharp.
 *
 * Run:  npx tsx scripts/generate-favicons.ts
 *
 * Outputs (public/):
 *   favicon.ico (16/32/48), favicon-16x16.png, favicon-32x32.png,
 *   apple-touch-icon.png (180), android-chrome-192x192.png,
 *   android-chrome-512x512.png, safari-pinned-tab.svg
 *   assets/logo-white.png  (white logo silhouette — used by the BrandLoader)
 *
 * Favicons use the colourful WDD icon mark (the gradient square with the white
 * "W") so the tab shows a recognisable brand mark at every size; app icons sit
 * on a white square for iOS/Android (which don't render transparency well).
 */

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "fs/promises";
import { resolve } from "path";

const pub = (p: string) => resolve(process.cwd(), "public", p);
const SRC = pub("assets/logo.png");
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Isolate the colourful WDD icon mark (the gradient box + white W) as a square. */
async function iconMark(): Promise<Buffer> {
  return sharp(SRC)
    .extract({ left: 2, top: 15, width: 60, height: 51 })
    .extend({ top: 4, bottom: 5, left: 0, right: 0, background: TRANSPARENT })
    .png()
    .toBuffer();
}

/** Recolour every opaque pixel of the full logo to pure white (keeps its alpha shape). */
async function whiteLogo(): Promise<Buffer> {
  const meta = await sharp(SRC).metadata();
  const width = meta.width ?? 247;
  const height = meta.height ?? 82;
  const alpha = await sharp(SRC).ensureAlpha().extractChannel(3).toColourspace("b-w").toBuffer();
  return sharp({ create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

/** Mark contained in a transparent square (for small favicons + .ico). */
async function transparentIcon(size: number, mark: Buffer): Promise<Buffer> {
  return sharp(mark).resize(size, size, { fit: "contain", background: TRANSPARENT }).png().toBuffer();
}

/** Mark centred (with padding) on a white square (for iOS / Android app icons). */
async function appIcon(size: number, mark: Buffer, padRatio = 0.14): Promise<Buffer> {
  const inner = Math.max(1, Math.round(size * (1 - padRatio * 2)));
  const m = await sharp(mark).resize(inner, inner, { fit: "contain", background: TRANSPARENT }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: m, gravity: "center" }])
    .png()
    .toBuffer();
}

// Monochrome Safari pinned-tab mark (Safari tints the black shape).
const SAFARI_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
  `<rect x="3" y="6" width="26" height="20" rx="5" fill="#000000"/>` +
  `</svg>\n`;

async function main() {
  console.log("→ Building white brand logo…");
  const white = await whiteLogo();
  await sharp(white).toFile(pub("assets/logo-white.png"));
  console.log("  ✓ public/assets/logo-white.png");

  const mark = await iconMark();

  console.log("→ Favicons…");
  await writeFile(pub("favicon-16x16.png"), await transparentIcon(16, mark));
  await writeFile(pub("favicon-32x32.png"), await transparentIcon(32, mark));
  console.log("  ✓ favicon-16x16.png, favicon-32x32.png");

  console.log("→ App icons…");
  await writeFile(pub("apple-touch-icon.png"), await appIcon(180, mark));
  await writeFile(pub("android-chrome-192x192.png"), await appIcon(192, mark));
  await writeFile(pub("android-chrome-512x512.png"), await appIcon(512, mark));
  console.log("  ✓ apple-touch-icon.png, android-chrome-192/512");

  console.log("→ favicon.ico (16/32/48)…");
  const icoBuffers = await Promise.all([16, 32, 48].map((s) => transparentIcon(s, mark)));
  await writeFile(pub("favicon.ico"), await pngToIco(icoBuffers));
  console.log("  ✓ favicon.ico");

  await writeFile(pub("safari-pinned-tab.svg"), SAFARI_SVG, "utf8");
  console.log("  ✓ safari-pinned-tab.svg");

  console.log("✓ Favicon set generated.");
}

main().catch((err) => {
  console.error("✗ favicon generation failed:", err);
  process.exit(1);
});
