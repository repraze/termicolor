import type {AccentName} from "@termicolor/palette";
import {mix} from "@termicolor/palette";

import {shade} from "../colors.ts";
import {el, fade, glowFilter, linearGradient, n, path, radialGradient} from "../svg.ts";
import type {Generator, RenderContext} from "../types.ts";

function accent(ctx: RenderContext, i: number): AccentName {
    const list = ctx.params.accents;
    return list[i % list.length]!;
}

function rect(ctx: RenderContext, fill: string, extra: Record<string, string> = {}): string {
    return el("rect", {width: ctx.size.width, height: ctx.size.height, fill, ...extra});
}

/** White center fading to black edges: used as a mask so grids dissolve toward the frame. */
function vignetteMask(ctx: RenderContext, id: string, inner = 0.35, edge = 0.15): string[] {
    const {width: w, height: h} = ctx.size;
    const r = Math.hypot(w, h) / 2;
    return [
        radialGradient(`${id}-g`, w / 2, h / 2, r, [
            {offset: 0, color: "#fff"},
            {offset: inner, color: "#fff"},
            {offset: 1, color: "#fff", opacity: edge},
        ]),
        el("mask", {id, maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(w), height: String(h)}, [
            rect(ctx, `url(#${id}-g)`),
        ]),
    ];
}

/** A lined pattern tile aligned so that a line crosses the canvas center. */
function gridPattern(
    ctx: RenderContext,
    id: string,
    pitch: number,
    stroke: string,
    width: number,
    opacity = 1,
): string {
    const {width: w, height: h} = ctx.size;
    const ox = (w / 2) % pitch;
    const oy = (h / 2) % pitch;
    return el(
        "pattern",
        {
            id,
            patternUnits: "userSpaceOnUse",
            width: n(pitch, 2),
            height: n(pitch, 2),
            patternTransform: `translate(${n(ox, 2)} ${n(oy, 2)})`,
        },
        el("path", {
            d: `M0 0H${n(pitch, 2)}M0 0V${n(pitch, 2)}`,
            fill: "none",
            stroke,
            "stroke-width": n(width * 2, 2),
            "stroke-opacity": opacity === 1 ? undefined : n(opacity, 2),
        }),
    );
}

const blueprint: Generator = {
    id: "blueprint",
    family: "grids",
    name: "Blueprint",
    description: "Minor and major grid with accent annotations: crosshairs, outlined frames, dimension lines.",
    defaults: {accents: ["purple", "cyan", "pink"], density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const minor = (40 - ctx.params.density * 16) * u;
        const major = minor * 5;
        const a0 = accent(ctx, 0);
        const a1 = accent(ctx, 1);
        const gx = w * rng.range(0.25, 0.75);
        const gy = h * rng.range(0.3, 0.7);
        const defs = [
            // Pattern lines straddle the tile edge, so half of each stroke is drawn: doubled width compensates.
            gridPattern(ctx, "minor", minor, c.dark ? c.lineStrong : c.line, 0.75 * u, c.dark ? 0.7 : 1),
            gridPattern(ctx, "major", major, c.ink(a0), 1.2 * u, c.dark ? 0.55 : 0.5),
            radialGradient("glow", gx, gy, Math.max(w, h) * 0.6, fade(c.fill(a0), c.dark ? 0.22 : 0.14, 8)),
            ...vignetteMask(ctx, "vig"),
        ];
        // Annotations snap to major intersections.
        const ox = (w / 2) % major;
        const oy = (h / 2) % major;
        const cols = Math.floor(w / major);
        const rows = Math.floor(h / major);
        const at = (i: number, j: number): [number, number] => [ox + i * major, oy + j * major];
        const marks: string[] = [];
        const sw = 2.2 * u;
        const tick = minor * 0.8;
        const crosses: string[] = [];
        const count = 6 + Math.round(ctx.params.density * 10);
        for (let k = 0; k < count; k++) {
            const [x, y] = at(rng.int(1, cols - 1), rng.int(1, rows - 1));
            crosses.push(`M${n(x - tick)} ${n(y)}H${n(x + tick)}M${n(x)} ${n(y - tick)}V${n(y + tick)}`);
        }
        marks.push(el("path", {d: crosses.join(""), stroke: c.ink(a1), "stroke-width": n(sw * 1.2)}));

        // Outlined frames with corner brackets.
        const frames = 3 + Math.round(ctx.params.density * 3);
        for (let k = 0; k < frames; k++) {
            const i = rng.int(0, cols - 3);
            const j = rng.int(0, rows - 2);
            const [x0, y0] = at(i, j);
            const fw = major * rng.int(1, 3);
            const fh = major * rng.int(1, 2);
            const color = c.ink(k === 0 ? a0 : rng.pick(ctx.params.accents));
            const b = minor;
            const corners = [
                `M${n(x0)} ${n(y0 + b)}V${n(y0)}H${n(x0 + b)}`,
                `M${n(x0 + fw - b)} ${n(y0)}H${n(x0 + fw)}V${n(y0 + b)}`,
                `M${n(x0 + fw)} ${n(y0 + fh - b)}V${n(y0 + fh)}H${n(x0 + fw - b)}`,
                `M${n(x0 + b)} ${n(y0 + fh)}H${n(x0)}V${n(y0 + fh - b)}`,
            ].join("");
            marks.push(
                el("rect", {
                    x: n(x0),
                    y: n(y0),
                    width: n(fw),
                    height: n(fh),
                    fill: color,
                    "fill-opacity": "0.1",
                    stroke: color,
                    "stroke-opacity": "0.5",
                    "stroke-width": n(sw * 0.7),
                    "stroke-dasharray": `${n(minor * 0.25)} ${n(minor * 0.25)}`,
                }),
                el("path", {d: corners, fill: "none", stroke: color, "stroke-width": n(sw * 2)}),
            );
        }

        // Dimension lines: a span between two intersections with end ticks.
        const dims: string[] = [];
        for (let k = 0; k < 2 + Math.round(ctx.params.density * 2); k++) {
            const [x, y] = at(rng.int(0, cols - 2), rng.int(1, rows - 1));
            const len = major * rng.int(1, 3);
            const yy = y + minor * 0.5;
            dims.push(
                `M${n(x)} ${n(yy)}H${n(x + len)}M${n(x)} ${n(yy - tick)}V${n(yy + tick)}M${n(x + len)} ${n(yy - tick)}V${n(yy + tick)}`,
            );
        }
        marks.push(el("path", {d: dims.join(""), stroke: c.fg, "stroke-opacity": "0.55", "stroke-width": n(sw)}));

        // Circle target.
        const [tx, ty] = at(rng.int(1, cols - 1), rng.int(1, rows - 1));
        const tr = major * rng.range(0.6, 1.2);
        marks.push(
            el("circle", {
                cx: n(tx),
                cy: n(ty),
                r: n(tr),
                fill: "none",
                stroke: c.ink(a0),
                "stroke-width": n(sw),
            }),
            el("circle", {
                cx: n(tx),
                cy: n(ty),
                r: n(tr * 0.55),
                fill: "none",
                stroke: c.ink(a0),
                "stroke-opacity": "0.6",
                "stroke-width": n(sw),
                "stroke-dasharray": `${n(minor * 0.4)} ${n(minor * 0.3)}`,
            }),
            el("circle", {cx: n(tx), cy: n(ty), r: n(4 * u), fill: c.glow(a0)}),
        );
        return {
            defs,
            body: [
                rect(ctx, c.base),
                rect(ctx, "url(#glow)"),
                el("g", {mask: "url(#vig)"}, [rect(ctx, "url(#minor)"), rect(ctx, "url(#major)")]),
                el("g", {fill: "none", "stroke-linecap": "square"}, marks),
            ],
        };
    },
};

const dots: Generator = {
    id: "dots",
    family: "grids",
    name: "Dot matrix",
    description: "Even dot grid; dots pick up accent color where soft glows pass behind them.",
    defaults: {accents: ["purple", "pink", "blue"], density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const pitch = (44 - ctx.params.density * 16) * u;
        const r = pitch * 0.19;
        const ox = (w / 2) % pitch;
        const oy = (h / 2) % pitch;
        const defs = [
            el(
                "pattern",
                {
                    id: "dot",
                    patternUnits: "userSpaceOnUse",
                    width: n(pitch, 2),
                    height: n(pitch, 2),
                    patternTransform: `translate(${n(ox - pitch / 2, 2)} ${n(oy - pitch / 2, 2)})`,
                },
                el("circle", {cx: n(pitch / 2, 2), cy: n(pitch / 2, 2), r: n(r, 2), fill: "#fff"}),
            ),
            el("mask", {id: "dots", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(w), height: String(h)}, [
                rect(ctx, "url(#dot)"),
            ]),
        ];
        const glows: string[] = [];
        const count = 3 + Math.round(ctx.params.density * 2);
        for (let i = 0; i < count; i++) {
            const x = w * rng.range(0.05, 0.95);
            const y = h * rng.range(0.05, 0.95);
            const gr = Math.max(w, h) * (i === 0 ? 0.42 : rng.range(0.2, 0.32));
            const name = accent(ctx, i);
            defs.push(radialGradient(`g${i}`, x, y, gr, fade(c.glow(name), 1, 6)));
            defs.push(radialGradient(`h${i}`, x, y, gr * 1.1, fade(c.fill(name), c.dark ? 0.1 : 0.07, 6)));
            glows.push(rect(ctx, `url(#g${i})`));
        }
        return {
            defs,
            body: [
                rect(ctx, c.base),
                // Faint halo outside the mask so the color seems to bleed off the dots.
                ...glows.map((_, i) => rect(ctx, `url(#h${i})`)),
                el("g", {mask: "url(#dots)"}, [rect(ctx, c.lineStrong), ...glows.reverse()]),
            ],
        };
    },
};

const isometric: Generator = {
    id: "isometric",
    family: "grids",
    name: "Isometric",
    description: "Isometric line lattice with clusters of solid and wireframe accent cubes.",
    defaults: {accents: ["purple", "cyan", "pink"], density: 0.5, grain: 0.3},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const s = (92 - ctx.params.density * 30) * u;
        const W = s * Math.sqrt(3);
        const H = s;
        // Lattice origin at the canvas center.
        const ox = ((w / 2) % W) - W;
        const oy = ((h / 2) % H) - H;
        const sw = n(1.2 * u, 2);
        // One tile holds both 30° diagonals (crossing at its center) and the verticals at 0, W/2, W.
        const [tw, th, hw] = [n(W, 2), n(H, 2), n(W / 2, 2)];
        const tile = `M0 0L${tw} ${th}M0 ${th}L${tw} 0M0 0V${th}M${hw} 0V${th}M${tw} 0V${th}`;
        const defs = [
            el(
                "pattern",
                {
                    id: "iso",
                    patternUnits: "userSpaceOnUse",
                    width: n(W, 2),
                    height: n(H, 2),
                    patternTransform: `translate(${n(ox, 2)} ${n(oy, 2)})`,
                },
                el("path", {d: tile, fill: "none", stroke: c.lineStrong, "stroke-width": sw}),
            ),
            ...vignetteMask(ctx, "vig", 0.2, 0.05),
        ];

        // Lattice point (i, j): column i at x = i·W/2, odd columns shifted down by H/2.
        const point = (i: number, j: number): [number, number] => [ox + (i * W) / 2, oy + j * H + (i % 2 ? H / 2 : 0)];
        const cols = Math.ceil((w - ox) / (W / 2));
        const rows = Math.ceil((h - oy) / H);
        // Cubes live in integer 3D coordinates: +x runs down-right, +y down-left, +z up. Every projected
        // corner lands on the lattice, and sorting by x + y + z gives a correct painter's order.
        type Cube = {x: number; y: number; z: number; name: AccentName; solid: boolean};
        type Cluster = {origin: [number, number]; k: number; cubes: Cube[]};
        const moves: [number, number, number][] = [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
        ];
        const clusters: Cluster[] = [];
        const clusterCount = 4 + Math.round(ctx.params.density * 3);
        for (let q = 0; q < clusterCount; q++) {
            const k = rng.chance(0.3) ? 2 : 1;
            const origin = point(rng.int(3, cols - 4), rng.int(2, rows - 4));
            const name = q === 0 ? accent(ctx, 0) : rng.pick(ctx.params.accents);
            const taken = new Map<string, Cube>();
            let [x, y, z] = [0, 0, 0];
            const len = rng.int(3, k === 2 ? 5 : 9);
            for (let step = 0; step < len; step++) {
                taken.set(`${x},${y},${z}`, {x, y, z, name, solid: rng.chance(0.7)});
                const [dx, dy, dz] = rng.pick(moves);
                // Stack up to 3 high; a sideways move drops back to the floor.
                [x, y, z] = [x + dx, y + dy, dz ? Math.min(2, z + 1) : 0];
            }
            const cubes = [...taken.values()].sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z) || a.z - b.z);
            clusters.push({origin, k, cubes});
        }
        clusters.sort((a, b) => a.origin[1] - b.origin[1] || a.origin[0] - b.origin[0]);
        const shapes = clusters
            .flatMap((cl) => cl.cubes.map((cube) => ({cube, cl})))
            .map(({cube, cl}) => {
                const hw = (W / 2) * cl.k;
                const hh = (H / 2) * cl.k;
                const e = s * cl.k;
                const ax = cl.origin[0] + (cube.x - cube.y) * hw;
                const ay = cl.origin[1] + (cube.x + cube.y) * hh - cube.z * e;
                const top = path(
                    [
                        [ax, ay],
                        [ax + hw, ay + hh],
                        [ax, ay + 2 * hh],
                        [ax - hw, ay + hh],
                    ],
                    true,
                );
                const left = path(
                    [
                        [ax - hw, ay + hh],
                        [ax, ay + 2 * hh],
                        [ax, ay + 2 * hh + e],
                        [ax - hw, ay + hh + e],
                    ],
                    true,
                );
                const right = path(
                    [
                        [ax, ay + 2 * hh],
                        [ax + hw, ay + hh],
                        [ax + hw, ay + hh + e],
                        [ax, ay + 2 * hh + e],
                    ],
                    true,
                );
                const ink = c.ink(cube.name);
                if (!cube.solid) {
                    return el("path", {
                        d: top + left + right,
                        fill: c.base,
                        "fill-opacity": "0.6",
                        stroke: c.glow(cube.name),
                        "stroke-width": n(1.6 * u, 2),
                        "stroke-linejoin": "round",
                    });
                }
                const l = c.dark ? 0.78 : 0.62;
                return el("g", {}, [
                    el("path", {d: top, fill: c.glow(cube.name)}),
                    el("path", {d: left, fill: shade(ink, l * 0.78)}),
                    el("path", {d: right, fill: shade(ink, l * 0.55)}),
                ]);
            });
        const glowAt = clusters[0]?.origin ?? [w / 2, h / 2];
        defs.push(
            radialGradient(
                "glow",
                glowAt[0]!,
                glowAt[1]!,
                Math.max(w, h) * 0.55,
                fade(c.fill(accent(ctx, 0)), 0.16, 8),
            ),
        );
        return {
            defs,
            body: [
                rect(ctx, c.base),
                rect(ctx, "url(#glow)"),
                el("g", {mask: "url(#vig)"}, rect(ctx, "url(#iso)")),
                el("g", {}, shapes),
            ],
        };
    },
};

const synthwave: Generator = {
    id: "synthwave",
    family: "grids",
    name: "Synthwave floor",
    description: "Perspective floor grid fading into the horizon, striped sun and wireframe ridge line.",
    defaults: {accents: ["pink", "purple", "orange", "cyan"], density: 0.5, grain: 0.4},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const [a0, a1, a2] = [accent(ctx, 0), accent(ctx, 1), accent(ctx, 2)];
        const hy = h * rng.range(0.56, 0.64);
        const vx = w * rng.range(0.42, 0.58);
        const floor = h - hy;

        // Sky and sun.
        const sunR = h * rng.range(0.17, 0.23);
        const sunX = w * rng.range(0.3, 0.7);
        const sunY = hy - sunR * rng.range(0.15, 0.45);
        const horizonTint = mix(c.base, c.fill(a1), c.dark ? 0.28 : 0.18);
        const stripes: string[] = [];
        // Gaps get thicker toward the bottom of the sun.
        for (let k = 0; k < 7; k++) {
            const t = k / 7;
            const y = sunY - sunR * 0.1 + t * sunR * 1.1;
            stripes.push(
                el("rect", {
                    x: n(sunX - sunR),
                    y: n(y),
                    width: n(sunR * 2),
                    height: n((1 + k * 1.6) * u * 3),
                    fill: "#000",
                }),
            );
        }
        const defs = [
            linearGradient(
                "sky",
                [0, 0],
                [0, hy],
                [
                    {offset: 0, color: c.base},
                    {offset: 0.55, color: c.base},
                    {offset: 1, color: horizonTint},
                ],
            ),
            linearGradient(
                "sun",
                [0, sunY - sunR],
                [0, sunY + sunR],
                [
                    {offset: 0, color: c.fill(a2)},
                    {offset: 0.55, color: c.fill(a0)},
                    {offset: 1, color: c.fill(a1)},
                ],
            ),
            el(
                "mask",
                {id: "sunmask", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(w), height: String(h)},
                [el("rect", {width: w, height: h, fill: "#fff"}), ...stripes],
            ),
            radialGradient("halo", sunX, sunY, sunR * 2.6, fade(c.fill(a0), c.dark ? 0.35 : 0.25, 8)),
            linearGradient(
                "floor",
                [0, hy],
                [0, h],
                [
                    {offset: 0, color: horizonTint},
                    {offset: 0.25, color: c.base},
                ],
            ),
            linearGradient(
                "depth",
                [0, hy],
                [0, hy + floor * 0.45],
                [
                    {offset: 0, color: "#fff", opacity: 0},
                    {offset: 1, color: "#fff"},
                ],
            ),
            el("mask", {id: "fade", maskUnits: "userSpaceOnUse", x: "0", y: "0", width: String(w), height: String(h)}, [
                el("rect", {y: n(hy), width: w, height: n(floor), fill: "url(#depth)"}),
            ]),
            glowFilter("glow", 7 * u, 1.4),
        ];

        // Floor grid: horizontal lines at depths 1/z, verticals converging on the vanishing point.
        const lines: string[] = [];
        const step = 0.32 - ctx.params.density * 0.12;
        for (let z = 1; z < 40; z += step * z) {
            const y = hy + floor / z;
            lines.push(`M0 ${n(y)}H${w}`);
        }
        const spacing = (190 - ctx.params.density * 70) * u;
        // Lines far to the side only show near the horizon; stop once they would leave the frame above 12% depth.
        const reach = Math.ceil(Math.max(vx, w - vx) / spacing / 0.12);
        for (let i = -reach; i <= reach; i++) {
            const bx = vx + i * spacing;
            lines.push(`M${n(vx)} ${n(hy)}L${n(bx)} ${h}`);
        }

        // Ridge line: jagged peaks sitting on the horizon.
        const ridge: [number, number][] = [[-10, hy]];
        let x = -10;
        while (x < w + 10) {
            x += rng.range(40, 140) * u;
            const centerGap = Math.abs(x - sunX) < sunR * 1.1;
            const peak = centerGap ? rng.range(0, 0.02) : rng.range(0.02, 0.1);
            ridge.push([x, hy - h * peak * (0.4 + 0.6 * Math.abs(Math.sin((x / w) * Math.PI * 3 + 1)))]);
        }
        ridge.push([w + 10, hy]);

        return {
            defs,
            body: [
                rect(ctx, "url(#sky)"),
                rect(ctx, "url(#halo)"),
                el("circle", {cx: n(sunX), cy: n(sunY), r: n(sunR), fill: "url(#sun)", mask: "url(#sunmask)"}),
                el("path", {
                    d: path(ridge, true),
                    fill: c.base,
                    stroke: c.ink(a1),
                    "stroke-width": n(2 * u),
                    "stroke-linejoin": "round",
                }),
                el("rect", {y: n(hy), width: w, height: n(floor), fill: "url(#floor)"}),
                el("g", {mask: "url(#fade)"}, [
                    el("path", {
                        d: lines.join(""),
                        fill: "none",
                        stroke: c.glow(a0),
                        "stroke-width": n(2 * u),
                        filter: c.dark ? "url(#glow)" : undefined,
                    }),
                ]),
                el("path", {d: `M0 ${n(hy)}H${w}`, stroke: c.glow(a0), "stroke-width": n(2.5 * u)}),
            ],
        };
    },
};

export const grids: Generator[] = [blueprint, dots, isometric, synthwave];
