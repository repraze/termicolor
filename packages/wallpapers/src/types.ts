import type {AccentName, ModeName, Palette} from "@termicolor/palette";

import type {Colors} from "./colors.ts";
import type {Rng} from "./random.ts";

export type Size = {width: number; height: number};

export const FAMILIES = {
    gradients: "Gradients",
    lines: "Lines and waves",
    patterns: "Patterns and grids",
} as const;
export type Family = keyof typeof FAMILIES;

/** Knobs shared by every generator. */
export type Params = {
    /** Accents to draw with, most prominent first. */
    accents: AccentName[];
    /** 0-1. How busy the image is (blobs, grid pitch, trace count…), per generator. */
    density: number;
    /** 0-1. Film grain strength; breaks up gradient banding on 8-bit displays. */
    grain: number;
};

export type RenderContext = {
    palette: Palette;
    mode: ModeName;
    size: Size;
    seed: number;
    params: Params;
    /** Seeded from generator id + seed only, so dark and light share one composition. */
    rng: Rng;
    /**
     * Layout unit. Generators draw in a design space whose short side is 1440, so `u` is 1 there; the
     * SVG `viewBox` then scales that to the requested pixel size.
     */
    u: number;
    colors: Colors;
};

export type Layers = {defs: string[]; body: string[]};

export type Generator = {
    id: string;
    family: Family;
    name: string;
    description: string;
    defaults: Params;
    render(ctx: RenderContext): Layers;
};
