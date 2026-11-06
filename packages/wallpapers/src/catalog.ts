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
    // 2. grids and dots
    entry("blueprint", 7),
    entry("blueprint", 21, {params: {accents: ["cyan", "purple", "green"]}}),
    entry("dots", 4),
    entry("dots", 17, {params: {accents: ["purple", "cyan", "green"], density: 0.8}}),
    entry("isometric", 3),
    entry("isometric", 10, {params: {accents: ["purple", "orange", "pink"]}}),
    entry("synthwave", 1),
    entry("synthwave", 8, {params: {accents: ["purple", "cyan", "pink", "blue"]}}),
    // 3. circuit
    entry("circuit", 1),
    entry("circuit", 5, {params: {accents: ["green", "cyan", "purple"]}}),
    entry("circuit", 9, {params: {accents: ["purple", "pink", "orange"], density: 0.9}}),
];

/** Sizes the port renders. Other 16:9 sizes scale the uhd SVG; the generators lay out per size. */
export const CATALOG_SIZES: readonly SizeName[] = ["uhd", "ultrawide"];

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
