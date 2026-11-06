/**
 * Rasterizes a small WebP thumbnail per wallpaper × mode × orientation into public/ports/wallpapers/thumbs/
 * for the gallery page. Runs after copy-data.ts (which wipes public/ports), so renders are cached by content
 * hash in node_modules/.cache and only new or changed SVGs are rendered again.
 */
import {createHash} from "node:crypto";
import {existsSync} from "node:fs";
import {copyFile, mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {Resvg} from "@resvg/resvg-js";
import sharp from "sharp";

import {filesFor, MODES, ORIENTATIONS, THUMB_SIZES, thumbPath, type WallpaperCatalog} from "../src/lib/wallpapers";

/** Bump to invalidate every cached thumbnail when the render settings change. */
const VERSION = 1;
const QUALITY = 82;

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(SITE, "../..");
const DIST = join(ROOT, "ports/wallpapers/dist");
const OUT = join(SITE, "public/ports/wallpapers");
const CACHE = join(SITE, "node_modules/.cache/wallpaper-thumbs");

async function render(svg: string, width: number, height: number): Promise<Buffer> {
    const png = new Resvg(svg, {fitTo: {mode: "width", value: width}, font: {loadSystemFonts: false}}).render().asPng();
    return sharp(png).resize(width, height, {fit: "cover"}).webp({quality: QUALITY}).toBuffer();
}

const started = performance.now();
const catalog = JSON.parse(await readFile(join(DIST, "catalog.json"), "utf8")) as WallpaperCatalog;
await mkdir(CACHE, {recursive: true});

let rendered = 0;
let cached = 0;
for (const entry of catalog.wallpapers) {
    for (const mode of MODES) {
        for (const orientation of ORIENTATIONS) {
            // the smallest file of the orientation: same drawing as the bigger ones, cheapest to parse
            const source = filesFor(entry, mode, orientation)[0];
            if (!source) {
                continue;
            }
            const {width, height} = THUMB_SIZES[orientation];
            const svg = await readFile(join(DIST, source.path), "utf8");
            const hash = createHash("sha256")
                .update(`${VERSION}:${width}x${height}:${QUALITY}:`)
                .update(svg)
                .digest("hex");
            const cachedFile = join(CACHE, `${hash.slice(0, 32)}.webp`);
            if (existsSync(cachedFile)) {
                cached++;
            } else {
                await writeFile(cachedFile, await render(svg, width, height));
                rendered++;
            }
            const target = join(OUT, thumbPath(entry.id, mode, orientation));
            await mkdir(dirname(target), {recursive: true});
            await copyFile(cachedFile, target);
        }
    }
}
const ms = Math.round(performance.now() - started);
console.log(`✓ wallpaper thumbnails: ${rendered} rendered, ${cached} cached (${ms} ms)`);
