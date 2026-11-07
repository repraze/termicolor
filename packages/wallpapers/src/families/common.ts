import type {AccentName, Hex} from "@repraze/termicolor";
import {rgb} from "@repraze/termicolor";

import {ramp} from "../colors.ts";
import {el, linearGradient, n, type Stop} from "../svg.ts";
import type {RenderContext} from "../types.ts";

export const DEG = Math.PI / 180;

/** The i-th accent, cycling through the list. */
export function accent(ctx: RenderContext, i: number): AccentName {
    const list = ctx.params.accents;
    return list[i % list.length]!;
}

/** Full-canvas rect. */
export function full(ctx: RenderContext, fill: string, extra: Record<string, string | undefined> = {}): string {
    return el("rect", {width: ctx.size.width, height: ctx.size.height, fill, ...extra});
}

/** True when the canvas is taller than wide. */
export function portrait(ctx: RenderContext): boolean {
    return ctx.size.height > ctx.size.width;
}

/** Gradient line through the canvas center at `angle` (degrees), long enough to cover every corner. */
export function span(ctx: RenderContext, angle: number): [[number, number], [number, number]] {
    const {width: w, height: h} = ctx.size;
    const dx = Math.cos(angle * DEG);
    const dy = Math.sin(angle * DEG);
    const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
    return [
        [w / 2 - dx * half, h / 2 - dy * half],
        [w / 2 + dx * half, h / 2 + dy * half],
    ];
}

/** A canvas-wide linear gradient across the given colors (OKLCH ramp), for fills or strokes. */
export function hueGradient(ctx: RenderContext, id: string, colors: Hex[], angle: number, steps = 10): string {
    const list: Stop[] = ramp(colors, steps).map((color, i) => ({offset: i / (steps - 1), color}));
    return linearGradient(id, ...span(ctx, angle), list);
}

/** Eased opacity ramp of one color: 0 at the start, `max` at the end. */
export function veil(color: string, max: number, steps = 8): Stop[] {
    return Array.from({length: steps + 1}, (_, i) => {
        const t = i / steps;
        return {offset: t, color, opacity: max * t * t * (3 - 2 * t)};
    });
}

/** `feComponentTransfer` table values (one string per channel) for a list of colors. */
export function tables(colors: Hex[]): {r: string; g: string; b: string} {
    const values = colors.map((c) => rgb(c));
    const channel = (k: "r" | "g" | "b") => values.map((v) => n(v[k] / 255, 3)).join(" ");
    return {r: channel("r"), g: channel("g"), b: channel("b")};
}

/** Full-canvas mask from the given content (white = visible). */
export function mask(ctx: RenderContext, id: string, children: string[]): string {
    const {width: w, height: h} = ctx.size;
    return el("mask", {id, maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(w), height: String(h)}, children);
}
