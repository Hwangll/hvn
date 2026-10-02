#!/usr/bin/env node
/* global process, console, URL */
/**
 * Generates the WebP and AVIF twins that StoryPicture serves next to every story photo.
 *
 *   node scripts/optimize-images.mjs            # photos whose twins are missing
 *   node scripts/optimize-images.mjs --force    # re-encode the AVIF twins too
 *
 * Only photos referenced from src/ are processed. For each one:
 *   - photo.webp  is created at most 1600px on the long edge (cwebp -q 80) if it does not exist yet;
 *                 an existing WebP is kept as is, and its size is the size the AVIF is made at.
 *   - photo.avif  is encoded from the original, not from the WebP (avifenc -q 55). On these photos AVIF q55
 *                 measured at least the WebP's SSIM at 25-40% fewer bytes.
 * Needs macOS `sips` plus `cwebp` and `avifenc` (brew install webp libavif).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const projectRoot = new URL("..", import.meta.url).pathname;
const force = process.argv.includes("--force");
const maxEdge = 1600;
const scratch = mkdtempSync(join(tmpdir(), "hvn-images-"));

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const size = (file) => {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file]).toString();
  return [Number(out.match(/pixelWidth: (\d+)/)[1]), Number(out.match(/pixelHeight: (\d+)/)[1])];
};

const referenced = new Set();
for (const file of walk(join(projectRoot, "src")).filter((path) => /\.(tsx?|css)$/.test(path))) {
  for (const [path] of readFileSync(file, "utf8").matchAll(/\/images\/story\/[\w./-]+\.(?:jpe?g|png)/gi)) referenced.add(path);
}

let count = 0;
try {
  for (const path of [...referenced].sort()) {
    const original = join(projectRoot, "public", path);
    if (!existsSync(original)) {
      console.warn(`missing original: ${path}`);
      continue;
    }
    const base = original.replace(/\.(jpe?g|png)$/i, "");
    const webp = `${base}.webp`;
    const avif = `${base}.avif`;
    const needsWebp = !existsSync(webp);
    if (!needsWebp && existsSync(avif) && !force) continue;
    // Both twins are encoded from the same resized pixels; an existing WebP fixes the published size.
    const [width, height] = size(original);
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const [targetWidth, targetHeight] = needsWebp ? [Math.round(width * scale), Math.round(height * scale)] : size(webp);
    const png = join(scratch, "frame.png");
    execFileSync("sips", ["-z", String(targetHeight), String(targetWidth), original, "-s", "format", "png", "--out", png], { stdio: "ignore" });
    if (needsWebp) execFileSync("cwebp", ["-quiet", "-q", "80", "-m", "6", png, "-o", webp]);
    execFileSync("avifenc", ["-q", "55", "-s", "4", "-y", "420", "-j", "all", png, avif], { stdio: "ignore" });
    count += 1;
    console.log(`${path}: ${targetWidth}x${targetHeight}  webp ${(statSync(webp).size / 1024).toFixed(0)}k  avif ${(statSync(avif).size / 1024).toFixed(0)}k`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
console.log(count ? `Encoded ${count} photo(s).` : "All twins are up to date.");
