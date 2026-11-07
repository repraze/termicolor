import {type AccentName, type ModeName, MODES, type Palette} from "@repraze/termicolor";

import {colorsFor} from "./colors.ts";
import {gradients} from "./families/gradients.ts";
import {grids} from "./families/grids.ts";
import {lines} from "./families/lines.ts";
import {patterns} from "./families/patterns.ts";
import {traceGenerators} from "./families/traces.ts";
import {chooseAccents, type HarmonyName} from "./harmony.ts";
import {createRng, hash} from "./random.ts";
import {document, el, grainFilter, n} from "./svg.ts";
import type {Generator, Params, Size, SpecParams} from "./types.ts";

export const GENERATORS: readonly Generator[] = [...gradients, ...lines, ...grids, ...patterns, ...traceGenerators];

export function getGenerator(id: string): Generator {
    const generator = GENERATORS.find((g) => g.id === id);
    if (!generator) {
        throw new Error(`Unknown wallpaper generator "${id}"`);
    }
    return generator;
}

export const SIZES = {
    fhd: {width: 1920, height: 1080},
    qhd: {width: 2560, height: 1440},
    uhd: {width: 3840, height: 2160},
    fhdPortrait: {width: 1080, height: 1920},
    qhdPortrait: {width: 1440, height: 2560},
    uhdPortrait: {width: 2160, height: 3840},
    // Not in the catalog output, but generators lay out for any aspect.
    ultrawide: {width: 3440, height: 1440},
    phone: {width: 1179, height: 2556},
} as const satisfies Record<string, Size>;
export type SizeName = keyof typeof SIZES;

export type WallpaperSpec = {
    generator: string;
    seed: number;
    params?: SpecParams;
};

export type ResolvedSpec = {
    params: Params;
    /** How the accents were chosen: a harmony name, or "custom" when the spec lists `accents`. */
    harmony: HarmonyName | "custom";
    lead: AccentName;
};

/**
 * The params a spec renders with. Colors come from the seed (lead + one of the generator's harmonies)
 * unless the spec pins `accents` (wins outright), `lead` or `harmony`.
 */
export function resolveSpec(spec: WallpaperSpec): ResolvedSpec {
    const generator = getGenerator(spec.generator);
    const {accents, lead, harmony, ...rest} = spec.params ?? {};
    if (accents) {
        if (!accents.length) {
            throw new Error(`${spec.generator}#${spec.seed}: accents must not be empty`);
        }
        return {params: {...generator.defaults, ...rest, accents}, harmony: "custom", lead: accents[0]!};
    }
    const choice = chooseAccents(generator.id, spec.seed, generator.harmonies, {lead, harmony});
    return {
        params: {...generator.defaults, ...rest, accents: choice.accents},
        harmony: choice.harmony,
        lead: choice.lead,
    };
}

export type RenderOptions = {
    palette: Palette;
    mode: ModeName;
    size: Size;
};

/**
 * Renders one wallpaper as an SVG string. Pure: the same spec, palette, mode and size always give
 * the same bytes. The composition depends only on generator + seed (and size), never on mode.
 */
export function renderWallpaper(spec: WallpaperSpec, {palette, mode, size}: RenderOptions): string {
    if (!MODES.includes(mode)) {
        throw new Error(`Unknown mode "${mode}"`);
    }
    const generator = getGenerator(spec.generator);
    const {params} = resolveSpec(spec);
    const colors = colorsFor(palette, mode);
    const design = designSize(size);
    const u = 1;
    const {defs, body} = generator.render({
        palette,
        mode,
        size: design,
        seed: spec.seed,
        params,
        rng: createRng(`${generator.id}:${spec.seed}`),
        u,
        colors,
    });
    if (params.grain > 0) {
        // Grain frequency is per output pixel, not per design unit, so it never aliases when scaled down.
        const perPixel = size.width / design.width;
        defs.push(grainFilter("grain", hash(`${generator.id}:${spec.seed}`), 0.7 * perPixel));
        // Overlay keeps mid-tones grainy without lifting the blacks.
        body.push(
            el("rect", {
                width: design.width,
                height: design.height,
                filter: "url(#grain)",
                opacity: n(params.grain * (colors.dark ? 0.22 : 0.16), 3),
                style: "mix-blend-mode:overlay",
            }),
        );
    }
    const title = `Termicolor ${generator.name} #${spec.seed} (${mode}, ${size.width}x${size.height})`;
    return document(size, design, title, defs, body);
}

/**
 * The coordinate space a generator draws in: the requested aspect ratio with a short side of 1440.
 * Every 16:9 size (1080p, QHD, 4K) shares one design, so they differ only in the SVG header.
 */
export function designSize(size: Size): Size {
    const k = DESIGN_SHORT_SIDE / Math.min(size.width, size.height);
    return {width: Math.round(size.width * k), height: Math.round(size.height * k)};
}

export const DESIGN_SHORT_SIDE = 1440;
