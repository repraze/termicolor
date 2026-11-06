import type {AccentName} from "@termicolor/palette";

import {el, fade, n, radialGradient} from "../svg.ts";
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
    family: "patterns",
    name: "Blueprint",
    description: "Minor and major grid with accent annotations: crosshairs, outlined frames, dimension lines.",
    harmonies: ["mono", "complementary", "split"],
    defaults: {density: 0.5, grain: 0.3},
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
    family: "patterns",
    name: "Dot matrix",
    description: "Even dot grid; dots pick up accent color where soft glows pass behind them.",
    harmonies: ["analogous", "sweep", "split"],
    defaults: {density: 0.5, grain: 0.3},
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

export const grids: Generator[] = [blueprint, dots];
