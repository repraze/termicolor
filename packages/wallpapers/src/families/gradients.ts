import type {AccentName} from "@termicolor/palette";

import {lerpOklch, ramp} from "../colors.ts";
import {blurFilter, el, fade, linearGradient, n, path, radialGradient, type Stop} from "../svg.ts";
import type {Generator, RenderContext} from "../types.ts";

const DEG = Math.PI / 180;

function accent(ctx: RenderContext, i: number): AccentName {
    const list = ctx.params.accents;
    return list[i % list.length]!;
}

function baseRect(ctx: RenderContext, fill = ctx.colors.base): string {
    return el("rect", {width: ctx.size.width, height: ctx.size.height, fill});
}

/** Gradient line through the canvas center at `angle`, long enough to cover every corner. */
function span(ctx: RenderContext, angle: number): [[number, number], [number, number]] {
    const {width: w, height: h} = ctx.size;
    const dx = Math.cos(angle * DEG);
    const dy = Math.sin(angle * DEG);
    const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
    return [
        [w / 2 - dx * half, h / 2 - dy * half],
        [w / 2 + dx * half, h / 2 + dy * half],
    ];
}

/** Eased opacity ramp of one color: 0 at the start, `max` at the end. */
function veil(color: string, max: number, steps = 8): Stop[] {
    return Array.from({length: steps + 1}, (_, i) => {
        const t = i / steps;
        return {offset: t, color, opacity: max * t * t * (3 - 2 * t)};
    });
}

const linear: Generator = {
    id: "linear",
    family: "gradients",
    name: "Linear",
    description: "Diagonal OKLCH ramp across 2-3 accents, sinking into the base color at one corner.",
    defaults: {accents: ["purple", "blue", "cyan"], density: 0.5, grain: 0.5},
    render(ctx) {
        const {rng, colors: c} = ctx;
        const angle = rng.range(-35, 35) + (rng.chance(0.5) ? 0 : 180);
        const anchors = ctx.params.accents.slice(0, 3).map((a) => c.fill(a));
        const hues = ramp(anchors, 12).map((color, i) => ({offset: i / 11, color}));
        // The veil runs roughly perpendicular so the luminous edge sits on one side only.
        const veilAngle = angle + 90 + rng.range(-25, 25);
        const depth = 0.8 + ctx.params.density * 0.2;
        return {
            defs: [
                linearGradient("hue", ...span(ctx, angle), hues),
                linearGradient("veil", ...span(ctx, veilAngle), veil(c.base, depth)),
            ],
            body: [baseRect(ctx, "url(#hue)"), baseRect(ctx, "url(#veil)")],
        };
    },
};

/** Stops for a glow that goes `core → main → edge accent → transparent`. */
function glowStops(core: string, main: string, edge: string, opacity: number): Stop[] {
    const stopsOut: Stop[] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const color = t < 0.4 ? lerpOklch(core, main, t / 0.4) : lerpOklch(main, edge, (t - 0.4) / 0.6);
        const e = 1 - t * t * (3 - 2 * t);
        stopsOut.push({offset: t, color, opacity: opacity * e});
    }
    return stopsOut;
}

const radial: Generator = {
    id: "radial",
    family: "gradients",
    name: "Radial",
    description: "One large off-center glow with a smaller counter-glow, on the base color.",
    defaults: {accents: ["purple", "pink", "blue"], density: 0.5, grain: 0.5},
    render(ctx) {
        const {rng, colors: c, size} = ctx;
        const {width: w, height: h} = size;
        const a0 = accent(ctx, 0);
        const a1 = accent(ctx, 1);
        const a2 = accent(ctx, 2);
        const side = rng.chance(0.5) ? 1 : -1;
        const cx = w / 2 + side * w * rng.range(0.12, 0.3);
        const cy = h * rng.range(0.55, 0.95);
        const r = Math.max(w, h) * (0.55 + ctx.params.density * 0.3);
        const cx2 = w / 2 - side * w * rng.range(0.25, 0.4);
        const cy2 = h * rng.range(0.05, 0.35);
        const r2 = r * rng.range(0.35, 0.5);
        const op = c.dark ? 1 : 0.85;
        return {
            defs: [
                radialGradient(
                    "main",
                    cx,
                    cy,
                    r,
                    glowStops(c.dark ? c.glow(a0) : c.fill(a0), c.fill(a0), c.fill(a1), op),
                    r * 0.75,
                ),
                radialGradient("counter", cx2, cy2, r2, glowStops(c.fill(a2), c.fill(a2), c.fill(a1), op * 0.6)),
            ],
            body: [baseRect(ctx), baseRect(ctx, "url(#counter)"), baseRect(ctx, "url(#main)")],
        };
    },
};

const conic: Generator = {
    id: "conic",
    family: "gradients",
    name: "Conic fan",
    description: "Conic sweep from a point below the frame, rays fanning upward and fading into the base.",
    defaults: {accents: ["purple", "pink", "orange", "blue"], density: 0.5, grain: 0.5},
    render(ctx) {
        const {rng, colors: c, size} = ctx;
        const {width: w, height: h} = size;
        const cx = w * rng.range(0.3, 0.7);
        const cy = h * rng.range(1.02, 1.25);
        const R = Math.hypot(w, h) * 1.2;
        // Only the visible arc is drawn: from the bottom-left corner's angle to the bottom-right's.
        const start = Math.atan2(h - cy, 0 - cx) / DEG - 8;
        const end = Math.atan2(h - cy, w - cx) / DEG + 8 + 360;
        const sweep = (((end - start) % 360) + 360) % 360 || 360;
        const anchors = ctx.params.accents.map((a) => c.fill(a));
        const wedges = 96;
        const colorsOut = ramp([...anchors, anchors[0]!], wedges);
        const body = [baseRect(ctx)];
        const overlap = 0.25;
        const parts = colorsOut.map((color, i) => {
            const a0 = (start + (sweep * i) / wedges - overlap) * DEG;
            const a1 = (start + (sweep * (i + 1)) / wedges + overlap) * DEG;
            const d = path(
                [
                    [cx, cy],
                    [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R],
                    [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R],
                ],
                true,
            );
            return el("path", {d, fill: color});
        });
        body.push(el("g", {opacity: n(c.dark ? 0.95 : 0.8, 2)}, parts));
        // Fade toward the far edge, plus a soft hot spot near the origin.
        // Denser = the color reaches further up before the base takes over.
        const reach = cy * (0.95 + ctx.params.density * 0.3);
        body.push(baseRect(ctx, "url(#fade)"));
        return {
            defs: [
                radialGradient("fade", cx, cy, reach, [
                    {offset: 0, color: c.base, opacity: 0},
                    {offset: 0.3, color: c.base, opacity: 0.05},
                    {offset: 0.55, color: c.base, opacity: 0.45},
                    {offset: 0.8, color: c.base, opacity: 0.85},
                    {offset: 1, color: c.base, opacity: 1},
                ]),
            ],
            body,
        };
    },
};

const mesh: Generator = {
    id: "mesh",
    family: "gradients",
    name: "Mesh",
    description: "4-6 soft accent points over the base, blended like a mesh gradient.",
    defaults: {accents: ["purple", "blue", "pink", "cyan"], density: 0.5, grain: 0.5},
    render(ctx) {
        const {rng, colors: c, size} = ctx;
        const {width: w, height: h} = size;
        const count = 4 + Math.round(ctx.params.density * 2);
        const defs: string[] = [];
        const blobs: string[] = [];
        // Points on a jittered ring so they don't clump; the first (main) accent gets the biggest blob.
        const phase = rng.range(0, 360);
        for (let i = 0; i < count; i++) {
            const a = (phase + (360 * i) / count + rng.range(-20, 20)) * DEG;
            const dist = rng.range(0.15, 0.48);
            const x = w / 2 + Math.cos(a) * w * dist;
            const y = h / 2 + Math.sin(a) * h * dist;
            const r = Math.max(w, h) * (i === 0 ? 0.5 : rng.range(0.28, 0.42));
            const name = accent(ctx, i);
            defs.push(
                radialGradient(`b${i}`, x, y, r, fade(c.fill(name), c.dark ? 0.85 : 0.7, 8), r * rng.range(0.6, 1)),
            );
            blobs.push(el("rect", {width: w, height: h, fill: `url(#b${i})`}));
        }
        // Screen on dark keeps overlaps luminous; plain alpha on light keeps the colors from washing out.
        const blend = c.dark ? "mix-blend-mode:screen" : undefined;
        return {
            defs,
            body: [baseRect(ctx), el("g", {style: blend}, blobs.reverse())],
        };
    },
};

/** A wavy ribbon: sum of a few seeded sines. */
function wave(ctx: RenderContext, y0: number, amp: number, points: number): [number, number][] {
    const {rng, size} = ctx;
    const terms = Array.from({length: 3}, (_, k) => ({
        f: (k + 1) * rng.range(0.6, 1.4),
        p: rng.range(0, Math.PI * 2),
        a: amp / (k + 1),
    }));
    return Array.from({length: points + 1}, (_, i) => {
        const x = (i / points) * size.width * 1.2 - size.width * 0.1;
        const t = (x / size.width) * Math.PI * 2;
        const y = y0 + terms.reduce((sum, term) => sum + Math.sin(t * term.f + term.p) * term.a, 0);
        return [x, y];
    });
}

const aurora: Generator = {
    id: "aurora",
    family: "gradients",
    name: "Aurora",
    description: "Blurred wavy bands of light across the upper half, over a dark-to-surface sky.",
    defaults: {accents: ["purple", "cyan", "green", "pink"], density: 0.5, grain: 0.6},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {height: h} = size;
        const bands = 3 + Math.round(ctx.params.density * 2);
        const defs: string[] = [blurFilter("soft", 46 * u), blurFilter("softer", 120 * u)];
        const shapes: string[] = [];
        for (let i = 0; i < bands; i++) {
            const name = accent(ctx, i);
            const y0 = h * (0.22 + (0.4 * i) / bands + rng.range(-0.04, 0.04));
            const thick = h * rng.range(0.1, 0.2);
            const top = wave(ctx, y0, h * rng.range(0.06, 0.14), 24);
            const bottom = top.map(([x, y]) => [x, y + thick] as [number, number]).reverse();
            // Bright crest fading downward like an aurora curtain.
            defs.push(
                linearGradient(
                    `a${i}`,
                    [0, y0 - h * 0.15],
                    [0, y0 + thick + h * 0.1],
                    [
                        {offset: 0, color: c.glow(name), opacity: 0},
                        {offset: 0.3, color: c.glow(name), opacity: 0.95},
                        {offset: 0.55, color: c.fill(name), opacity: 0.6},
                        {offset: 1, color: c.fill(name), opacity: 0},
                    ],
                ),
            );
            shapes.push(el("path", {d: path([...top, ...bottom], true, 0), fill: `url(#a${i})`}));
        }
        const sky = c.dark ? c.surface : c.base;
        defs.push(
            linearGradient(
                "sky",
                [0, 0],
                [0, h],
                [
                    {offset: 0, color: c.base},
                    {offset: 1, color: sky},
                ],
            ),
        );
        const blend = c.dark ? "mix-blend-mode:screen" : undefined;
        return {
            defs,
            body: [
                baseRect(ctx, "url(#sky)"),
                el("g", {filter: "url(#softer)", opacity: "0.7", style: blend}, shapes),
                el("g", {filter: "url(#soft)", style: blend}, shapes),
            ],
        };
    },
};

export const gradients: Generator[] = [linear, radial, conic, mesh, aurora];
