import {type ModeName, MODES, type Palette} from "@termicolor/palette";

import {getGenerator, renderWallpaper, type SizeName, SIZES, type WallpaperSpec} from "./render.ts";
import type {Family} from "./types.ts";

export type CatalogEntry = WallpaperSpec & {
    /** Stable file name, `<generator>-<seed>` unless renamed. */
    id: string;
    note?: string;
};

const entry = (generator: string, seed: number, extra: Omit<CatalogEntry, "id" | "generator" | "seed"> = {}) => ({
    id: `${generator}-${seed}`,
    generator,
    seed,
    ...extra,
});

/** Seeds we keep. Documented in CATALOG.md; the port renders every entry in both modes. */
export const CATALOG: readonly CatalogEntry[] = [
    // 1. gradients
    entry("linear", 3),
    entry("linear", 11, {params: {accents: ["pink", "purple", "orange"]}}),
    entry("radial", 2),
    entry("radial", 9, {params: {accents: ["cyan", "blue", "purple"]}}),
    entry("conic", 4),
    entry("conic", 12, {params: {accents: ["purple", "blue", "cyan", "green"]}}),
    entry("mesh", 1),
    entry("mesh", 6, {params: {accents: ["purple", "pink", "orange", "yellow"]}}),
    entry("mesh", 8, {params: {accents: ["cyan", "blue", "purple", "green"], density: 1}}),
    entry("aurora", 5),
    entry("aurora", 13, {params: {accents: ["purple", "pink", "blue"]}}),
    entry("noise", 2),
    entry("noise", 7, {params: {accents: ["purple", "pink", "orange"]}}),
    entry("posterize", 3),
    entry("bands", 1),
    entry("bands", 6, {params: {accents: ["pink", "purple", "blue", "cyan"]}}),
    // 2. lines and waves
    entry("stripes", 2),
    entry("stripes", 9, {params: {accents: ["cyan", "blue", "purple"]}}),
    entry("moire", 1),
    entry("moire", 4, {params: {accents: ["purple", "orange", "cyan"]}}),
    entry("waves", 3),
    entry("waves", 8, {params: {accents: ["pink", "purple", "orange"]}}),
    entry("contours", 1),
    entry("contours", 6, {params: {accents: ["purple", "blue", "cyan"]}}),
    entry("flow", 2),
    entry("flow", 5, {params: {accents: ["purple", "pink", "orange", "yellow"]}}),
    entry("glitch", 1),
    entry("glitch", 4, {params: {accents: ["purple", "cyan", "green"]}}),
    // 3. patterns and grids
    entry("blueprint", 7),
    entry("dots", 4),
    entry("halftone", 1),
    entry("halftone", 5, {params: {accents: ["purple", "blue", "cyan"]}}),
    entry("plaid", 3),
    entry("plaid", 8, {params: {accents: ["purple", "cyan", "green"]}}),
    entry("truchet", 2),
    entry("maze", 1),
    entry("cells", 4),
    entry("cells", 9, {params: {accents: ["purple", "pink", "orange"]}}),
    entry("traces", 1),
    entry("traces", 5, {params: {accents: ["purple", "green", "cyan"]}}),
];

/** Sizes the port renders: 16:9 landscape and 9:16 portrait at 1080p, QHD and 4K. */
export const CATALOG_SIZES: readonly SizeName[] = ["fhd", "qhd", "uhd", "fhdPortrait", "qhdPortrait", "uhdPortrait"];

export type CatalogFile = {
    path: string;
    contents: string;
    entry: CatalogEntry;
    family: Family;
    mode: ModeName;
    size: SizeName;
};

export function catalogPath(entry: CatalogEntry, mode: ModeName, size: SizeName): string {
    const {width, height} = SIZES[size];
    return `${mode}/${width}x${height}/${entry.id}.svg`;
}

export function renderCatalog(
    palette: Palette,
    sizes: readonly SizeName[] = CATALOG_SIZES,
    entries: readonly CatalogEntry[] = CATALOG,
): CatalogFile[] {
    const files: CatalogFile[] = [];
    for (const mode of MODES) {
        for (const size of sizes) {
            for (const e of entries) {
                files.push({
                    path: catalogPath(e, mode, size),
                    contents: renderWallpaper(e, {palette, mode, size: SIZES[size]}),
                    entry: e,
                    family: getGenerator(e.generator).family,
                    mode,
                    size,
                });
            }
        }
    }
    return files;
}
