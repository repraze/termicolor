import type {AccentName, ModeName, Palette} from "@termicolor/palette";

import type {Colors} from "./colors.ts";
import type {HarmonyName} from "./harmony.ts";
import type {Rng} from "./random.ts";

export type Size = {width: number; height: number};

export const FAMILIES = {
    gradients: "Gradients",
    lines: "Lines and waves",
    patterns: "Patterns and grids",
} as const;
export type Family = keyof typeof FAMILIES;

/** Knobs shared by every generator. */
/** Resolved knobs a generator draws with. */
export type Params = {
    /** Accents to draw with, lead first. Seeded from a harmony unless a spec pins it. */
    accents: AccentName[];
    /** 0-1. How busy the image is (blobs, grid pitch, trace count…), per generator. */
    density: number;
    /** 0-1. Film grain strength; breaks up gradient banding on 8-bit displays. */
    grain: number;
};

/** What a catalog entry may set. Anything left out is seeded (colors) or a generator default. */
export type SpecParams = Partial<Params> & {
    /** Pin the lead accent; the harmony still comes from the seed unless pinned too. */
    lead?: AccentName;
    harmony?: HarmonyName;
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
    /** Harmonies the seed may pick from: the ones that suit this generator. */
    harmonies: readonly HarmonyName[];
    defaults: Omit<Params, "accents">;
    render(ctx: RenderContext): Layers;
};
