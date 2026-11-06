import type {AccentName} from "@termicolor/palette";
import {mix} from "@termicolor/palette";

import type {Rng} from "../random.ts";
import {el, fade, glowFilter, n, radialGradient} from "../svg.ts";
import type {Generator} from "../types.ts";

/** 8 directions, clockwise from east. Odd indexes are the 45° diagonals. */
const DIRS: readonly (readonly [number, number])[] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
];

type Point = [number, number];
type Trace = {points: Point[]; color: AccentName | null; lit: boolean; dots: boolean};

/** Occupancy grid in cell units, plus the diagonal edges taken (so two diagonals never cross). */
class Board {
    readonly cells: Uint8Array;
    readonly diagonals = new Set<string>();
    constructor(
        readonly cols: number,
        readonly rows: number,
    ) {
        this.cells = new Uint8Array(cols * rows);
    }
    inside(x: number, y: number) {
        return x >= 1 && y >= 1 && x < this.cols - 1 && y < this.rows - 1;
    }
    free(x: number, y: number) {
        return this.inside(x, y) && this.cells[y * this.cols + x] === 0;
    }
    take(x: number, y: number) {
        if (this.inside(x, y)) {
            this.cells[y * this.cols + x] = 1;
        }
    }
    /** Can a trace step from (x, y) in direction d? */
    canStep(x: number, y: number, d: number) {
        const [dx, dy] = DIRS[d]!;
        if (!this.free(x + dx, y + dy)) {
            return false;
        }
        // A diagonal step crosses the other diagonal of the same cell square.
        return !(
            dx &&
            dy &&
            this.diagonals.has(`${Math.min(x, x + dx)},${Math.min(y, y + dy)},${dx * dy > 0 ? "/" : "\\"}`)
        );
    }
    step(x: number, y: number, d: number) {
        const [dx, dy] = DIRS[d]!;
        if (dx && dy) {
            this.diagonals.add(`${Math.min(x, x + dx)},${Math.min(y, y + dy)},${dx * dy > 0 ? "\\" : "/"}`);
        }
        this.take(x + dx, y + dy);
    }
}

/** Runs a bus of parallel traces in lockstep from `starts`, sharing one seeded sequence of 45° turns. */
function routeBus(board: Board, rng: Rng, starts: Point[], dir: number, maxLen: number): Point[][] {
    const heads = starts.map(([x, y]) => ({x, y, alive: board.free(x, y), points: [[x, y]] as Point[]}));
    for (const h of heads) {
        if (h.alive) {
            board.take(h.x, h.y);
        }
    }
    let d = dir;
    let run = 0;
    const minRun = 3;
    for (let s = 0; s < maxLen; s++) {
        if (run >= minRun && rng.chance(0.12)) {
            // Turn 45° left or right; from a diagonal, prefer to straighten out again.
            const turn = d % 2 === 1 ? (rng.chance(0.5) ? 1 : -1) : rng.chance(0.5) ? 1 : -1;
            d = (d + turn + 8) % 8;
            run = 0;
            for (const h of heads) {
                if (h.alive) {
                    h.points.push([h.x, h.y]);
                }
            }
        }
        let moved = false;
        for (const h of heads) {
            if (!h.alive) {
                continue;
            }
            if (!board.canStep(h.x, h.y, d)) {
                h.alive = false;
                continue;
            }
            board.step(h.x, h.y, d);
            h.x += DIRS[d]![0];
            h.y += DIRS[d]![1];
            moved = true;
        }
        run++;
        if (!moved) {
            break;
        }
    }
    return heads
        .map((h) => {
            const last = h.points[h.points.length - 1]!;
            if (last[0] !== h.x || last[1] !== h.y) {
                h.points.push([h.x, h.y]);
            }
            return h.points;
        })
        .filter((points) => points.length > 1);
}

function length(points: Point[]) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += Math.max(Math.abs(points[i]![0] - points[i - 1]![0]), Math.abs(points[i]![1] - points[i - 1]![1]));
    }
    return total;
}

const traces: Generator = {
    id: "traces",
    family: "patterns",
    name: "Traces",
    description: "Bundles of parallel lines on a grid with 45° bends, never crossing, ending in dots. Some are lit.",
    harmonies: ["mono", "analogous", "complementary", "split"],
    defaults: {density: 0.5, grain: 0.25},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const cell = 20 * u;
        const cols = Math.floor(w / cell);
        const rows = Math.floor(h / cell);
        const offX = (w - cols * cell) / 2;
        const offY = (h - rows * cell) / 2;
        const board = new Board(cols, rows);
        const accents = ctx.params.accents;
        const density = ctx.params.density;

        const list: Trace[] = [];
        // Wide bundles first so they get the long runs; thinner ones fill the gaps.
        const spawns = Math.round(((cols * rows) / 60) * (0.5 + density));
        for (let k = 0; k < spawns; k++) {
            const early = k < spawns * 0.25;
            const x = rng.int(2, cols - 3);
            const y = rng.int(2, rows - 3);
            const dir = rng.int(0, 3) * 2;
            const width = early ? rng.int(4, 9) : rng.chance(0.4) ? rng.int(2, 5) : 1;
            const [px, py] = DIRS[(dir + 2) % 8]!;
            const starts = Array.from({length: width}, (_, i) => [x + px * i * 2, y + py * i * 2] as Point);
            const lit = rng.chance(early ? 0.55 : 0.15);
            const color = lit || rng.chance(0.2) ? (k === 0 ? accents[0]! : rng.pick(accents)) : null;
            const dots = rng.chance(0.7);
            for (const points of routeBus(board, rng, starts, dir, rng.int(early ? 30 : 6, early ? 90 : 40))) {
                if (length(points) >= 2) {
                    list.push({points, color, lit, dots});
                }
            }
        }

        // Everything lives in cell units under one transform, so coordinates stay small integers.
        const strokeOf = (name: AccentName | null, lit: boolean) =>
            name === null ? c.lineStrong : lit ? c.ink(name) : mix(c.base, c.ink(name), c.dark ? 0.45 : 0.4);
        const groups = new Map<string, Trace[]>();
        for (const t of list) {
            const key = `${t.lit ? 1 : 0}|${t.color ?? ""}`;
            groups.set(key, [...(groups.get(key) ?? []), t]);
        }
        // Order by lit, then accent position (not name), so re-coloring a seed never reorders its layers.
        const rank = (key: string) => Number(key[0]) * 100 + accents.indexOf(key.slice(2) as AccentName);
        const layers = [...groups.keys()]
            .sort((a, b) => rank(a) - rank(b))
            .map((key) => {
                const group = groups.get(key)!;
                const lit = key.startsWith("1");
                const name = (key.slice(2) || null) as AccentName | null;
                const d = group.map((t) => t.points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")).join("");
                const ends = group
                    .filter((t) => t.dots)
                    .flatMap((t) => [t.points[0]!, t.points[t.points.length - 1]!])
                    .map(([x, y]) => `M${x} ${y}h0`)
                    .join("");
                return el(
                    "g",
                    {
                        filter: lit && c.dark ? "url(#glow)" : undefined,
                        stroke: strokeOf(name, lit),
                        fill: "none",
                        "stroke-linecap": "round",
                    },
                    [
                        el("path", {d, "stroke-width": lit ? ".24" : ".18", "stroke-linejoin": "round"}),
                        ends ? el("path", {d: ends, "stroke-width": ".7"}) : "",
                    ],
                );
            });

        return {
            defs: [
                glowFilter("glow", 0.35, 1.2),
                radialGradient(
                    "glow-bg",
                    w / 2,
                    h / 2,
                    Math.max(w, h) * 0.7,
                    fade(c.fill(accents[0]!), c.dark ? 0.14 : 0.08, 8),
                ),
            ],
            body: [
                el("rect", {width: w, height: h, fill: c.base}),
                el("rect", {width: w, height: h, fill: "url(#glow-bg)"}),
                el("g", {transform: `translate(${n(offX, 2)} ${n(offY, 2)}) scale(${n(cell, 3)})`}, layers),
            ],
        };
    },
};

export const traceGenerators: Generator[] = [traces];
