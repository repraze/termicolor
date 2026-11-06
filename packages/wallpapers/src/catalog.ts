import {type ModeName, MODES, type Palette} from "@termicolor/palette";

import {getGenerator, renderWallpaper, resolveSpec, type SizeName, SIZES, type WallpaperSpec} from "./render.ts";
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

/**
 * Seeds we keep. Colors come from each seed (lead + harmony, see harmony.ts), chosen so every accent
 * leads 5 of the 40. `params` can still pin `accents`, `lead` or `harmony`. CATALOG.md's table is
 * generated from this list (`npm run catalog -w @termicolor/wallpapers`).
 */
export const CATALOG: readonly CatalogEntry[] = [
    // 1. gradients
    entry("linear", 1),
    entry("linear", 3),
    entry("radial", 2),
    entry("radial", 4),
    entry("conic", 7),
    entry("conic", 10),
    entry("mesh", 9),
    entry("mesh", 22),
    entry("mesh", 1),
    entry("aurora", 4),
    entry("aurora", 3),
    entry("noise", 2),
    entry("noise", 3),
    entry("posterize", 2),
    entry("bands", 2),
    entry("bands", 33),
    // 2. lines and waves
    entry("stripes", 1),
    entry("stripes", 2),
    entry("moire", 1),
    entry("moire", 4),
    entry("waves", 3),
    entry("waves", 4),
    entry("contours", 1),
    entry("contours", 8),
    entry("flow", 1),
    entry("flow", 2),
    entry("glitch", 2),
    entry("glitch", 7),
    // 3. patterns and grids
    entry("blueprint", 2),
    entry("dots", 3),
    entry("halftone", 13),
    entry("halftone", 30),
    entry("plaid", 1),
    entry("plaid", 2),
    entry("truchet", 1),
    entry("maze", 4),
    entry("cells", 4),
    entry("cells", 5),
    entry("traces", 1),
    entry("traces", 9),
];

/** One row per kept wallpaper: what CATALOG.md and catalog.json show. */
export function describeEntry(e: CatalogEntry) {
    const {harmony, lead, params} = resolveSpec(e);
    const generator = getGenerator(e.generator);
    return {id: e.id, generator: e.generator, family: generator.family, seed: e.seed, harmony, lead, params};
}

/** The kept-seeds table for CATALOG.md, already in Prettier's aligned-table layout. */
export function catalogTable(entries: readonly CatalogEntry[] = CATALOG): string {
    const head = ["Id", "Generator", "Seed", "Harmony", "Accents (lead first)", "Overrides"];
    const rows = entries.map((e) => {
        const d = describeEntry(e);
        const {accents: _a, ...rest} = d.params;
        const defaults = getGenerator(e.generator).defaults;
        const overrides = Object.entries(rest)
            .filter(([k, v]) => defaults[k as keyof typeof defaults] !== v)
            .map(([k, v]) => `${k} ${v}`);
        return [
            `\`${d.id}\``,
            d.generator,
            String(d.seed),
            d.harmony,
            d.params.accents.join(", "),
            overrides.join(", "),
        ];
    });
    const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]!.length)));
    const line = (cells: string[]) => `| ${cells.map((c, i) => c.padEnd(widths[i]!)).join(" | ")} |`;
    return [line(head), `| ${widths.map((w) => "-".repeat(w)).join(" | ")} |`, ...rows.map(line)].join("\n");
}

/** Lead accent → number of kept wallpapers it leads. */
export function leadCounts(entries: readonly CatalogEntry[] = CATALOG): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of entries) {
        const {lead} = resolveSpec(e);
        counts[lead] = (counts[lead] ?? 0) + 1;
    }
    return counts;
}

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
