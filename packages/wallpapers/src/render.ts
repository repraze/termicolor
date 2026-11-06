import {type ModeName, MODES, type Palette} from "@termicolor/palette";

import {colorsFor} from "./colors.ts";
import {circuits} from "./families/circuit.ts";
import {gradients} from "./families/gradients.ts";
import {grids} from "./families/grids.ts";
import {createRng, hash} from "./random.ts";
import {document, el, grainFilter, n} from "./svg.ts";
import type {Generator, Params, Size} from "./types.ts";

export const GENERATORS: readonly Generator[] = [...gradients, ...grids, ...circuits];

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
    ultrawide: {width: 3440, height: 1440},
    superUltrawide: {width: 5120, height: 1440},
    phone: {width: 1179, height: 2556},
} as const satisfies Record<string, Size>;
export type SizeName = keyof typeof SIZES;

export type WallpaperSpec = {
    generator: string;
    seed: number;
    params?: Partial<Params>;
};

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
    const params: Params = {...generator.defaults, ...spec.params};
    if (!params.accents.length) {
        throw new Error(`${spec.generator}#${spec.seed}: accents must not be empty`);
    }
    const colors = colorsFor(palette, mode);
    const u = Math.min(size.width, size.height) / 1440;
    const {defs, body} = generator.render({
        palette,
        mode,
        size,
        seed: spec.seed,
        params,
        rng: createRng(`${generator.id}:${spec.seed}`),
        u,
        colors,
    });
    if (params.grain > 0) {
        defs.push(grainFilter("grain", hash(`${generator.id}:${spec.seed}`), 0.85));
        // Overlay keeps mid-tones grainy without lifting the blacks.
        body.push(
            el("rect", {
                width: size.width,
                height: size.height,
                filter: "url(#grain)",
                opacity: n(params.grain * (colors.dark ? 0.22 : 0.16), 3),
                style: "mix-blend-mode:overlay",
            }),
        );
    }
    const title = `Termicolor ${generator.name} #${spec.seed} (${mode}, ${size.width}x${size.height})`;
    return document(size.width, size.height, title, defs, body);
}
