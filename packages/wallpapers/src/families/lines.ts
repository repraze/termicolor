import {ramp, shade} from "../colors.ts";
import {fbm, perlin} from "../noise.ts";
import {el, glowFilter, linearGradient, n, relPath, simplify} from "../svg.ts";
import type {Generator, RenderContext} from "../types.ts";
import {accent, DEG, full, hueGradient, portrait, span, veil} from "./common.ts";

type Pt = [number, number];

/** Accent fills for the configured accents, the lead accent first. */
function inks(ctx: RenderContext): string[] {
    const c = ctx.colors;
    return ctx.params.accents.map((a) => (c.dark ? c.fill(a) : c.ink(a)));
}

const stripes: Generator = {
    id: "stripes",
    family: "lines",
    name: "Halftone stripes",
    description: "Tilted parallel stripes whose width swells and thins with a noise field, in an accent gradient.",
    defaults: {accents: ["purple", "pink", "blue"], density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const theta = rng.pick([30, 45, 60, 120, 135, 150]) + rng.range(-6, 6);
        const pitch = (46 - ctx.params.density * 20) * u;
        const field = fbm(perlin(rng), 3);
        const scale = 900 * u;
        const ox = rng.range(0, 50);
        const oy = rng.range(0, 50);
        const tx = Math.cos(theta * DEG);
        const ty = Math.sin(theta * DEG);
        const [nx, ny] = [-ty, tx];
        const diag = Math.hypot(w, h) / 2 + pitch;
        const samples = 40;
        const polys: string[] = [];
        for (let s = -diag; s <= diag; s += pitch) {
            const left: Pt[] = [];
            const right: Pt[] = [];
            for (let i = 0; i <= samples; i++) {
                const t = -diag + (2 * diag * i) / samples;
                const cx = w / 2 + nx * s + tx * t;
                const cy = h / 2 + ny * s + ty * t;
                const v = Math.min(1, Math.max(0, 0.5 + field(cx / scale + ox, cy / scale + oy) * 1.3));
                const half = pitch * 0.5 * (0.06 + 0.84 * v * v);
                left.push([cx - nx * half, cy - ny * half]);
                right.push([cx + nx * half, cy + ny * half]);
            }
            const outline = [...simplify(left, 1), ...simplify(right, 1).reverse()];
            polys.push(relPath(outline, true));
        }
        return {
            defs: [hueGradient(ctx, "hue", inks(ctx), theta + 90)],
            body: [full(ctx, c.base), el("path", {d: polys.join(""), fill: "url(#hue)"})],
        };
    },
};

const moire: Generator = {
    id: "moire",
    family: "lines",
    name: "Moiré rings",
    description: "Two or three overlapping sets of fine concentric rings; the interference makes the pattern.",
    defaults: {accents: ["purple", "cyan", "pink"], density: 0.5, grain: 0.2},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const pitch = (24 - ctx.params.density * 8) * u;
        const sets = rng.chance(0.4) ? 3 : 2;
        const groups: string[] = [];
        for (let k = 0; k < sets; k++) {
            const cx = w * rng.range(0.15, 0.85);
            const cy = h * rng.range(0.15, 0.85);
            const reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
            const rings: string[] = [];
            for (let r = pitch; r < reach; r += pitch) {
                rings.push(el("circle", {r: n(r)}));
            }
            const color = c.dark ? c.glow(accent(ctx, k)) : c.ink(accent(ctx, k));
            groups.push(
                el(
                    "g",
                    {
                        transform: `translate(${n(cx)} ${n(cy)})`,
                        fill: "none",
                        stroke: color,
                        "stroke-width": n(pitch * 0.4, 2),
                        "stroke-opacity": c.dark ? "0.8" : "0.7",
                    },
                    rings,
                ),
            );
        }
        return {
            defs: [],
            body: [
                full(ctx, c.base),
                el("g", {style: c.dark ? "mix-blend-mode:screen" : "mix-blend-mode:multiply"}, groups),
            ],
        };
    },
};

const waves: Generator = {
    id: "waves",
    family: "lines",
    name: "Interference",
    description: "A stack of lines along the long axis, displaced by ripples from 2-3 point sources.",
    defaults: {accents: ["purple", "blue", "cyan"], density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const tall = portrait(ctx);
        const L = tall ? h : w;
        const S = tall ? w : h;
        const lines = Math.round(40 + ctx.params.density * 30);
        const gap = S / lines;
        const sources = Array.from({length: rng.int(2, 3)}, () => ({
            a: L * rng.range(0.1, 0.9),
            b: S * rng.range(0.1, 0.9),
            wl: rng.range(70, 140) * u,
            ph: rng.range(0, Math.PI * 2),
            amp: gap * rng.range(1.2, 2.4),
        }));
        const fall = S * 0.55;
        const step = 26 * u;
        const paths: string[] = [];
        for (let k = -2; k <= lines + 2; k++) {
            const pts: Pt[] = [];
            for (let a = -step; a <= L + step; a += step) {
                const b0 = k * gap;
                let d = 0;
                for (const s of sources) {
                    const dist = Math.hypot(a - s.a, b0 - s.b);
                    d += s.amp * Math.sin((dist / s.wl) * Math.PI * 2 + s.ph) * Math.exp(-dist / fall);
                }
                const b = b0 + d;
                pts.push(tall ? [b, a] : [a, b]);
            }
            paths.push(relPath(simplify(pts, 1.3)));
        }
        const angle = tall ? 0 : 90;
        return {
            defs: [hueGradient(ctx, "hue", inks(ctx), angle), glowFilter("glow", 3 * u, 0.9)],
            body: [
                full(ctx, c.base),
                el("path", {
                    d: paths.join(""),
                    fill: "none",
                    stroke: "url(#hue)",
                    "stroke-width": n(Math.max(1.6 * u, gap * 0.18), 2),
                    filter: c.dark ? "url(#glow)" : undefined,
                }),
            ],
        };
    },
};

/** Marching squares: iso-lines of `field` at `level`, chained into polylines. */
function isolines(values: Float64Array, nx: number, ny: number, cell: number, level: number): Pt[][] {
    const at = (i: number, j: number) => values[j * nx + i]!;
    const points = new Map<number, Pt>();
    // Edge ids: horizontal edge (i,j)-(i+1,j) = 2·(j·nx+i); vertical edge (i,j)-(i,j+1) = 2·(j·nx+i)+1.
    const edgePoint = (id: number): Pt => {
        let p = points.get(id);
        if (!p) {
            const base = id >> 1;
            const i = base % nx;
            const j = (base - i) / nx;
            const v0 = at(i, j);
            const v1 = id & 1 ? at(i, j + 1) : at(i + 1, j);
            const t = (level - v0) / (v1 - v0);
            p = id & 1 ? [i * cell, (j + t) * cell] : [(i + t) * cell, j * cell];
            points.set(id, p);
        }
        return p;
    };
    const segments: [number, number][] = [];
    for (let j = 0; j < ny - 1; j++) {
        for (let i = 0; i < nx - 1; i++) {
            const tl = at(i, j) > level ? 8 : 0;
            const tr = at(i + 1, j) > level ? 4 : 0;
            const br = at(i + 1, j + 1) > level ? 2 : 0;
            const bl = at(i, j + 1) > level ? 1 : 0;
            const code = tl | tr | br | bl;
            if (code === 0 || code === 15) {
                continue;
            }
            const top = 2 * (j * nx + i);
            const bottom = 2 * ((j + 1) * nx + i);
            const left = 2 * (j * nx + i) + 1;
            const right = 2 * (j * nx + i + 1) + 1;
            const table: Record<number, [number, number][]> = {
                1: [[left, bottom]],
                2: [[bottom, right]],
                3: [[left, right]],
                4: [[top, right]],
                5: [
                    [left, top],
                    [bottom, right],
                ],
                6: [[top, bottom]],
                7: [[left, top]],
                8: [[left, top]],
                9: [[top, bottom]],
                10: [
                    [left, bottom],
                    [top, right],
                ],
                11: [[top, right]],
                12: [[left, right]],
                13: [[bottom, right]],
                14: [[left, bottom]],
            };
            segments.push(...table[code]!);
        }
    }
    const byEdge = new Map<number, number[]>();
    segments.forEach(([a, b], k) => {
        byEdge.set(a, [...(byEdge.get(a) ?? []), k]);
        byEdge.set(b, [...(byEdge.get(b) ?? []), k]);
    });
    const used = new Uint8Array(segments.length);
    const lines: Pt[][] = [];
    const walk = (from: number, edge: number, out: number[]) => {
        let current = edge;
        let seg = from;
        for (;;) {
            const next = (byEdge.get(current) ?? []).find((k) => k !== seg && !used[k]);
            if (next === undefined) {
                return;
            }
            used[next] = 1;
            const [a, b] = segments[next]!;
            current = a === current ? b : a;
            seg = next;
            out.push(current);
        }
    };
    for (let k = 0; k < segments.length; k++) {
        if (used[k]) {
            continue;
        }
        used[k] = 1;
        const [a, b] = segments[k]!;
        const forward: number[] = [b];
        walk(k, b, forward);
        const backward: number[] = [];
        walk(k, a, backward);
        const ids = [...backward.reverse(), a, ...forward];
        lines.push(ids.map(edgePoint));
    }
    return lines;
}

const contours: Generator = {
    id: "contours",
    family: "lines",
    name: "Contours",
    description: "Topographic iso-lines of a fractal noise field; color climbs the accent ramp with elevation.",
    defaults: {accents: ["purple", "pink", "orange"], density: 0.5, grain: 0.25},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const cell = 16 * u;
        const nx = Math.ceil(w / cell) + 2;
        const ny = Math.ceil(h / cell) + 2;
        const field = fbm(perlin(rng), 4);
        const scale = 800 * u;
        const ox = rng.range(0, 100);
        const oy = rng.range(0, 100);
        const values = new Float64Array(nx * ny);
        let lo = Infinity;
        let hi = -Infinity;
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                const v = field((i * cell) / scale + ox, (j * cell) / scale + oy);
                values[j * nx + i] = v;
                lo = Math.min(lo, v);
                hi = Math.max(hi, v);
            }
        }
        const levels = Math.round(16 + ctx.params.density * 14);
        // Low ground in a dim lead accent, climbing through the accents to a bright peak.
        const peak = c.glow(accent(ctx, ctx.params.accents.length - 1));
        const colors = ramp([shade(c.ink(accent(ctx, 0)), c.dark ? 0.42 : 0.75, 0.7), ...inks(ctx), peak], levels);
        const paths: string[] = [];
        for (let k = 1; k <= levels; k++) {
            const level = lo + ((hi - lo) * k) / (levels + 1);
            const d = isolines(values, nx, ny, cell, level)
                .map((line) => relPath(simplify(line, 1.2)))
                .join("");
            const major = k % 4 === 0;
            paths.push(
                el("path", {
                    d,
                    stroke: colors[k - 1]!,
                    "stroke-width": n((major ? 4 : 2) * u, 2),
                }),
            );
        }
        return {
            defs: [],
            body: [
                full(ctx, c.base),
                el("g", {fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round"}, paths),
            ],
        };
    },
};

const flow: Generator = {
    id: "flow",
    family: "lines",
    name: "Flow field",
    description: "Evenly spaced streamlines through a curl-like noise field, colored in accent bands.",
    defaults: {accents: ["purple", "cyan", "blue", "pink"], density: 0.5, grain: 0.25},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const field = fbm(perlin(rng), 2);
        const scale = (1300 - ctx.params.density * 500) * u;
        const turn = rng.range(1.5, 3);
        const base = rng.range(0, Math.PI * 2);
        const angle = (x: number, y: number) => base + field(x / scale, y / scale) * Math.PI * turn;
        const sep = (18 - ctx.params.density * 6) * u;
        const step = sep * 0.6;
        const gw = Math.ceil(w / sep) + 1;
        const gh = Math.ceil(h / sep) + 1;
        const owner = new Int32Array(gw * gh).fill(-1);
        const groups = ctx.params.accents.map(() => [] as string[]);
        const starts: Pt[] = [];
        const seedPitch = sep * 2.5;
        for (let y = seedPitch / 2; y < h; y += seedPitch) {
            for (let x = seedPitch / 2; x < w; x += seedPitch) {
                starts.push([x + rng.range(-0.4, 0.4) * seedPitch, y + rng.range(-0.4, 0.4) * seedPitch]);
            }
        }
        const order = rng.shuffle(starts);
        const cellOf = (x: number, y: number) => Math.floor(y / sep) * gw + Math.floor(x / sep);
        order.forEach(([sx, sy], id) => {
            if (owner[cellOf(sx, sy)] !== -1) {
                return;
            }
            const trace = (dir: 1 | -1): Pt[] => {
                const pts: Pt[] = [];
                let [x, y] = [sx, sy];
                for (let s = 0; s < 220; s++) {
                    const a = angle(x, y);
                    x += Math.cos(a) * step * dir;
                    y += Math.sin(a) * step * dir;
                    if (x < -sep || y < -sep || x > w + sep || y > h + sep) {
                        break;
                    }
                    if (x >= 0 && y >= 0 && x < w && y < h) {
                        const cell = cellOf(x, y);
                        if (owner[cell] !== -1 && owner[cell] !== id) {
                            break;
                        }
                        owner[cell] = id;
                    }
                    pts.push([x, y]);
                }
                return pts;
            };
            owner[cellOf(sx, sy)] = id;
            const line = [...trace(-1).reverse(), [sx, sy] as Pt, ...trace(1)];
            if (line.length < 8) {
                return;
            }
            // Color by where the line starts, in bands across the canvas diagonal.
            const t = (sx / w + sy / h) / 2;
            const g = Math.min(groups.length - 1, Math.floor(t * groups.length + rng.range(-0.3, 0.3)));
            groups[Math.max(0, g)]!.push(relPath(simplify(line, 1.5)));
        });
        const colors = inks(ctx);
        return {
            defs: [],
            body: [
                full(ctx, c.base),
                el(
                    "g",
                    {fill: "none", "stroke-width": n(Math.max(1.6 * u, sep * 0.22), 2), "stroke-linecap": "round"},
                    groups.map((d, i) => (d.length ? el("path", {d: d.join(""), stroke: colors[i]!}) : "")),
                ),
            ],
        };
    },
};

const glitch: Generator = {
    id: "glitch",
    family: "lines",
    name: "Glitch bands",
    description:
        "A gradient sliced into horizontal bands, some shifted sideways, with RGB-split slivers and scanlines.",
    defaults: {accents: ["purple", "pink", "cyan"], density: 0.5, grain: 0.4},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const [a0, a1, a2] = [accent(ctx, 0), accent(ctx, 1), accent(ctx, 2)];
        // The hue runs mostly sideways in every orientation, so the horizontal slice shifts stay visible.
        const angle = rng.range(-30, 30) + (rng.chance(0.5) ? 0 : 180);
        const fills = [c.fill(a0), c.fill(a1), c.fill(a2)];
        const veilAngle = angle + 90 + (rng.chance(0.5) ? 0 : 180);
        const slices: string[] = [];
        let y = 0;
        while (y < h) {
            const bh = rng.chance(0.25) ? rng.range(40, 160) * u : rng.range(4, 26) * u;
            if (rng.chance(0.35 + ctx.params.density * 0.3)) {
                const shift = rng.range(-0.18, 0.18) * w;
                slices.push(
                    el("rect", {
                        x: n(-w * 0.2),
                        y: n(y),
                        width: n(w * 1.4),
                        height: n(bh),
                        fill: "url(#hue)",
                        transform: `translate(${n(shift)} 0)`,
                    }),
                );
                if (rng.chance(0.45)) {
                    const split = rng.chance(0.5) ? c.glow(a2) : c.glow(a1);
                    slices.push(
                        el("rect", {
                            x: n(rng.range(0, w * 0.6)),
                            y: n(y + bh * rng.range(0, 0.7)),
                            width: n(rng.range(0.1, 0.5) * w),
                            height: n(Math.max(2 * u, bh * 0.15)),
                            fill: split,
                            opacity: "0.85",
                        }),
                    );
                }
            }
            y += bh;
        }
        const line = c.dark ? "#000" : "#fff";
        return {
            defs: [
                hueGradient(ctx, "hue", fills, angle),
                linearGradient("veil", ...span(ctx, veilAngle), veil(c.base, c.dark ? 0.8 : 0.7)),
                el(
                    "pattern",
                    {id: "scan", patternUnits: "userSpaceOnUse", width: "8", height: n(6 * u, 2)},
                    el("rect", {width: "8", height: n(2.5 * u, 2), fill: line}),
                ),
            ],
            body: [
                full(ctx, "url(#hue)"),
                ...slices,
                full(ctx, "url(#veil)"),
                full(ctx, "url(#scan)", {opacity: c.dark ? "0.35" : "0.25"}),
            ],
        };
    },
};

export const lines: Generator[] = [stripes, moire, waves, contours, flow, glitch];
