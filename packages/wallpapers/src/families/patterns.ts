import {mix} from "@termicolor/palette";

import {ramp} from "../colors.ts";
import {fbm, perlin} from "../noise.ts";
import {el, n, relPath} from "../svg.ts";
import type {Generator, RenderContext} from "../types.ts";
import {accent, full, hueGradient, mask} from "./common.ts";

type Pt = [number, number];

function inks(ctx: RenderContext): string[] {
    const c = ctx.colors;
    return ctx.params.accents.map((a) => (c.dark ? c.fill(a) : c.ink(a)));
}

const halftone: Generator = {
    id: "halftone",
    family: "patterns",
    name: "Halftone",
    description: "Hex dot screen; dot size follows a noise field plus a soft focus, colored by an accent gradient.",
    harmonies: ["analogous", "sweep", "complementary"],
    defaults: {density: 0.5, grain: 0.2},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const pitch = (32 - ctx.params.density * 12) * u;
        const rowH = pitch * 0.866;
        const field = fbm(perlin(rng), 3);
        const scale = 800 * u;
        const [fx, fy] = [w * rng.range(0.2, 0.8), h * rng.range(0.2, 0.8)];
        const reach = Math.max(w, h) * 0.75;
        const buckets = 9;
        // Runs of neighbouring dots with the same size become one dashed segment (`stroke-dasharray: 0
        // pitch` + round caps puts a dot every pitch), which is far smaller than one subpath per dot.
        const runs: {x: number; y: number; k: number}[][] = Array.from({length: buckets}, () => []);
        for (let row = 0, y = pitch / 2; y < h + pitch; row++, y += rowH) {
            let current: {x: number; y: number; k: number; b: number} | null = null;
            for (let x = row % 2 ? pitch : pitch / 2; x < w + pitch; x += pitch) {
                const focus = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / reach);
                const v = Math.min(1, Math.max(0, focus * 0.9 + field(x / scale, y / scale) * 0.9));
                const b = Math.round(v * buckets);
                if (current && current.b === b) {
                    current.k++;
                    continue;
                }
                if (current && current.b > 0) {
                    runs[current.b - 1]!.push(current);
                }
                current = {x, y: Math.round(y), k: 1, b};
            }
            if (current && current.b > 0) {
                runs[current.b - 1]!.push(current);
            }
        }
        const encode = (list: {x: number; y: number; k: number}[]) => {
            let d = "";
            let pen: Pt | null = null;
            for (const r of list) {
                const len = (r.k - 1) * pitch + 0.5;
                d += pen ? `m${n(r.x - pen[0])} ${r.y - pen[1]}`.replace(/ -/g, "-") : `M${n(r.x)} ${r.y}`;
                d += `h${n(len)}`;
                pen = [r.x + len, r.y];
            }
            return d;
        };
        const max = pitch * 0.96;
        return {
            defs: [hueGradient(ctx, "hue", inks(ctx), rng.range(0, 180))],
            body: [
                full(ctx, c.base),
                el(
                    "g",
                    {stroke: "url(#hue)", "stroke-linecap": "round", "stroke-dasharray": `0 ${n(pitch)}`},
                    runs.map((list, i) =>
                        list.length
                            ? el("path", {d: encode(list), "stroke-width": n((max * (i + 1)) / buckets, 2)})
                            : "",
                    ),
                ),
            ],
        };
    },
};

const plaid: Generator = {
    id: "plaid",
    family: "patterns",
    name: "Plaid",
    description: "Crossing translucent accent bands and pinstripes over a fine diagonal twill.",
    harmonies: ["complementary", "split", "analogous", "tetrad"],
    defaults: {density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const shapes: string[] = [];
        const pins: string[] = [];
        const count = Math.round(4 + ctx.params.density * 5);
        for (const axis of ["x", "y"] as const) {
            const len = axis === "x" ? w : h;
            for (let k = 0; k < count; k++) {
                const pos = rng.range(-0.05, 1) * len;
                const thick = rng.range(0.03, 0.16) * Math.min(w, h);
                const name = k === 0 ? accent(ctx, 0) : rng.pick(ctx.params.accents);
                const opacity = rng.range(0.25, 0.55);
                const color = c.fill(name);
                shapes.push(
                    axis === "x"
                        ? el("rect", {x: n(pos), width: n(thick), height: h, fill: color, opacity: n(opacity, 2)})
                        : el("rect", {y: n(pos), width: w, height: n(thick), fill: color, opacity: n(opacity, 2)}),
                );
                if (rng.chance(0.6)) {
                    const p = pos + thick + rng.range(6, 30) * u;
                    pins.push(axis === "x" ? `M${Math.round(p)} 0V${h}` : `M0 ${Math.round(p)}H${w}`);
                }
            }
        }
        const twill = 7 * u;
        return {
            defs: [
                el(
                    "pattern",
                    {id: "twill", patternUnits: "userSpaceOnUse", width: n(twill, 2), height: n(twill, 2)},
                    el("path", {
                        d: `M0 ${n(twill, 2)}L${n(twill, 2)} 0`,
                        stroke: c.dark ? "#000" : "#fff",
                        "stroke-width": n(twill * 0.35, 2),
                    }),
                ),
            ],
            body: [
                full(ctx, c.base),
                el("g", {style: c.dark ? "mix-blend-mode:screen" : "mix-blend-mode:multiply"}, shapes),
                el("path", {
                    d: pins.join(""),
                    stroke: c.dark ? c.glow(accent(ctx, 1)) : c.ink(accent(ctx, 1)),
                    "stroke-width": n(2.2 * u, 2),
                    opacity: "0.8",
                }),
                full(ctx, "url(#twill)", {opacity: c.dark ? "0.45" : "0.35"}),
            ],
        };
    },
};

/** Lays one of two tile symbols per cell, masked over an accent gradient so color flows across tiles. */
function tiled(ctx: RenderContext, pitch: number, tileA: string, tileB: string, strokeWidth: number) {
    const {rng, colors: c, size} = ctx;
    const {width: w, height: h} = size;
    const cols = Math.ceil(w / pitch) + 1;
    const rows = Math.ceil(h / pitch) + 1;
    const ox = (w - cols * pitch) / 2;
    const oy = (h - rows * pitch) / 2;
    const uses: string[] = [];
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            uses.push(el("use", {href: rng.chance(0.5) ? "#ta" : "#tb", x: n(ox + i * pitch), y: n(oy + j * pitch)}));
        }
    }
    const tileAttrs = {fill: "none", stroke: "#fff", "stroke-width": n(strokeWidth, 2), "stroke-linecap": "round"};
    return {
        defs: [
            el("path", {id: "ta", d: tileA, ...tileAttrs}),
            el("path", {id: "tb", d: tileB, ...tileAttrs}),
            hueGradient(ctx, "hue", inks(ctx), rng.range(0, 180)),
            mask(ctx, "tiles", uses),
        ],
        body: [
            full(ctx, c.base),
            full(ctx, mix(c.base, c.fill(accent(ctx, 0)), c.dark ? 0.06 : 0.04)),
            full(ctx, "url(#hue)", {mask: "url(#tiles)"}),
        ],
    };
}

const truchet: Generator = {
    id: "truchet",
    family: "patterns",
    name: "Truchet",
    description: "Quarter-circle Truchet tiles with 3 parallel strands, forming endless winding paths.",
    harmonies: ["mono", "analogous", "sweep", "complementary"],
    defaults: {density: 0.5, grain: 0.25},
    render(ctx) {
        const p = Math.round((130 - ctx.params.density * 50) * ctx.u);
        const g = p / 6;
        // Tile A: arcs around the top-left and bottom-right corners; tile B: the other two corners.
        const arcs = (corners: [Pt, Pt]) =>
            corners
                .flatMap(([cx, cy]) =>
                    [-g, 0, g].map((d) => {
                        const r = p / 2 + d;
                        const sx = cx === 0 ? r : p - r;
                        const ey = cy === 0 ? r : p - r;
                        // Arc from the point on the horizontal edge to the point on the vertical edge.
                        const sweep = (cx === 0) === (cy === 0) ? 1 : 0;
                        return `M${n(sx)} ${cy}A${n(r)} ${n(r)} 0 0 ${sweep} ${cx} ${n(ey)}`;
                    }),
                )
                .join("");
        const a = arcs([
            [0, 0],
            [p, p],
        ]);
        const b = arcs([
            [p, 0],
            [0, p],
        ]);
        return tiled(ctx, p, a, b, g * 0.42);
    },
};

const maze: Generator = {
    id: "maze",
    family: "patterns",
    name: "Diagonal maze",
    description: "10 PRINT-style tiles: one diagonal per cell, either way, for an endless maze texture.",
    harmonies: ["sweep", "analogous", "complementary"],
    defaults: {density: 0.5, grain: 0.25},
    render(ctx) {
        const {rng, colors: c, size} = ctx;
        const {width: w, height: h} = size;
        const p = Math.round((64 - ctx.params.density * 24) * ctx.u);
        const cols = Math.ceil(w / p) + 1;
        const rows = Math.ceil(h / p) + 1;
        const ox = Math.round((w - cols * p) / 2);
        const oy = Math.round((h - rows * p) / 2);
        // One relative path per row: each cell is `l p p` (\) or `l p -p` (/), with a move only when the
        // next cell doesn't start where the pen is. Far smaller than a <use> per cell.
        const rowPaths: string[] = [];
        for (let j = 0; j < rows; j++) {
            const y = oy + j * p;
            let d = "";
            let pen: [number, number] | null = null;
            for (let i = 0; i < cols; i++) {
                const x = ox + i * p;
                const back = rng.chance(0.5);
                const start: [number, number] = back ? [x, y] : [x, y + p];
                if (!pen) {
                    d += `M${start[0]} ${start[1]}`;
                } else if (pen[0] !== start[0] || pen[1] !== start[1]) {
                    d += `m0 ${start[1] - pen[1]}`;
                }
                d += back ? `l${p} ${p}` : `l${p}-${p}`;
                pen = [x + p, back ? y + p : y];
            }
            rowPaths.push(d);
        }
        return {
            defs: [hueGradient(ctx, "hue", inks(ctx), rng.range(0, 180))],
            body: [
                full(ctx, c.base),
                full(ctx, mix(c.base, c.fill(accent(ctx, 0)), c.dark ? 0.06 : 0.04)),
                el("path", {
                    d: rowPaths.join(""),
                    fill: "none",
                    stroke: "url(#hue)",
                    "stroke-width": n(p * 0.16, 2),
                    "stroke-linecap": "round",
                }),
            ],
        };
    },
};

/** Clips convex polygon `poly` to the half-plane closer to `a` than to `b`. */
function clipHalf(poly: Pt[], a: Pt, b: Pt): Pt[] {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const side = (p: Pt) => (p[0] - mx) * dx + (p[1] - my) * dy;
    const out: Pt[] = [];
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i]!;
        const q = poly[(i + 1) % poly.length]!;
        const sp = side(p);
        const sq = side(q);
        if (sp <= 0) {
            out.push(p);
        }
        if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
            const t = sp / (sp - sq);
            out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
        }
    }
    return out;
}

const cells: Generator = {
    id: "cells",
    family: "patterns",
    name: "Cells",
    description: "Voronoi cells with dark gaps; a few cells lit in accents, the rest in near-base tints.",
    harmonies: ["analogous", "sweep", "split", "tetrad"],
    defaults: {density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const pitch = (190 - ctx.params.density * 80) * u;
        const sites: Pt[] = [];
        for (let y = -pitch / 2; y < h + pitch; y += pitch) {
            for (let x = -pitch / 2; x < w + pitch; x += pitch) {
                sites.push([x + rng.range(-0.45, 0.45) * pitch, y + rng.range(-0.45, 0.45) * pitch]);
            }
        }
        const lit = ramp(inks(ctx), 7);
        const groups = new Map<string, string[]>();
        const fx = w * rng.range(0.2, 0.8);
        const fy = h * rng.range(0.2, 0.8);
        const reach = Math.max(w, h) * 0.6;
        for (const s of sites) {
            let poly: Pt[] = [
                [-pitch, -pitch],
                [w + pitch, -pitch],
                [w + pitch, h + pitch],
                [-pitch, h + pitch],
            ];
            for (const o of sites) {
                if (o !== s && Math.abs(o[0] - s[0]) < pitch * 2.5 && Math.abs(o[1] - s[1]) < pitch * 2.5) {
                    poly = clipHalf(poly, s, o);
                }
            }
            if (poly.length < 3) {
                continue;
            }
            // Cells near the focus are more likely to light up.
            const near = Math.max(0, 1 - Math.hypot(s[0] - fx, s[1] - fy) / reach);
            const t = Math.min(0.999, Math.max(0, (s[0] / w) * 0.6 + (s[1] / h) * 0.4));
            const tint = lit[Math.floor(t * lit.length)]!;
            const color = rng.chance(0.12 + near * 0.5)
                ? tint
                : mix(c.base, tint, rng.pick(c.dark ? [0.06, 0.1, 0.16] : [0.05, 0.09, 0.14]));
            groups.set(color, [...(groups.get(color) ?? []), relPath(poly, true)]);
        }
        const bright = [...groups.keys()].sort();
        return {
            defs: [],
            body: [
                full(ctx, c.base),
                el(
                    "g",
                    {stroke: c.base, "stroke-width": n(7 * u, 2), "stroke-linejoin": "round"},
                    bright.map((color) => el("path", {d: groups.get(color)!.join(""), fill: color})),
                ),
            ],
        };
    },
};

export const patterns: Generator[] = [halftone, plaid, truchet, maze, cells];
