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
type Trace = {points: Point[]; color: AccentName | null; lit: boolean; end: "via" | "pad" | "none"; startVia: boolean};
type Chip = {x: number; y: number; w: number; h: number; color: AccentName};

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

const circuit: Generator = {
    id: "circuit",
    family: "circuit",
    name: "Circuit traces",
    description: "Chips and parallel buses routed orthogonally with 45° bends, ending in vias. Some traces are lit.",
    defaults: {accents: ["purple", "cyan", "pink"], density: 0.5, grain: 0.25},
    render(ctx) {
        const {rng, colors: c, size, u} = ctx;
        const {width: w, height: h} = size;
        const cell = 22 * u;
        const cols = Math.floor(w / cell);
        const rows = Math.floor(h / cell);
        const offX = (w - cols * cell) / 2;
        const offY = (h - rows * cell) / 2;
        const board = new Board(cols, rows);
        const accents = ctx.params.accents;
        const density = ctx.params.density;

        // 1. Chips: non-overlapping blocks with a margin. Traces leave from their pins.
        const chips: Chip[] = [];
        const chipCount = 3 + Math.round(density * 4);
        for (let attempt = 0; attempt < 200 && chips.length < chipCount; attempt++) {
            const cw = rng.int(4, 12);
            const ch = rng.int(4, 9);
            const x = rng.int(3, cols - cw - 4);
            const y = rng.int(3, rows - ch - 4);
            const clash = chips.some(
                (o) => x < o.x + o.w + 4 && o.x < x + cw + 4 && y < o.y + o.h + 4 && o.y < y + ch + 4,
            );
            if (!clash) {
                chips.push({x, y, w: cw, h: ch, color: chips.length === 0 ? accents[0]! : rng.pick(accents)});
            }
        }
        for (const chip of chips) {
            for (let y = chip.y; y <= chip.y + chip.h; y++) {
                for (let x = chip.x; x <= chip.x + chip.w; x++) {
                    board.take(x, y);
                }
            }
        }

        const traces: Trace[] = [];
        /** `pinDir`: the bus leaves a chip in that direction, so its traces are extended back to the pin tips. */
        const addBus = (paths: Point[][], color: AccentName | null, lit: boolean, pinDir?: number) => {
            for (const points of paths) {
                if (length(points) < 2) {
                    continue;
                }
                const end = rng.chance(0.75) ? "via" : rng.chance(0.5) ? "pad" : "none";
                if (pinDir === undefined) {
                    traces.push({points, color, lit, end, startVia: true});
                    continue;
                }
                const [dx, dy] = DIRS[pinDir]!;
                const [x0, y0] = points[0]!;
                traces.push({points: [[x0 - dx * 0.65, y0 - dy * 0.65], ...points], color, lit, end, startVia: false});
            }
        };

        // 2. Buses out of each chip side, through every other pin.
        for (const chip of chips) {
            const sides: {dir: number; starts: Point[]}[] = [
                {dir: 0, starts: range(chip.y + 1, chip.y + chip.h - 1, 2).map((y) => [chip.x + chip.w + 1, y])},
                {dir: 4, starts: range(chip.y + 1, chip.y + chip.h - 1, 2).map((y) => [chip.x - 1, y])},
                {dir: 2, starts: range(chip.x + 1, chip.x + chip.w - 1, 2).map((x) => [x, chip.y + chip.h + 1])},
                {dir: 6, starts: range(chip.x + 1, chip.x + chip.w - 1, 2).map((x) => [x, chip.y - 1])},
            ];
            for (const side of sides) {
                if (!rng.chance(0.85)) {
                    continue;
                }
                const lit = rng.chance(0.45);
                const color = lit || rng.chance(0.3) ? chip.color : null;
                addBus(routeBus(board, rng, side.starts, side.dir, rng.int(12, 60)), color, lit, side.dir);
            }
        }

        // 3. Free-standing buses and single traces to fill the board.
        const spawns = Math.round(((cols * rows) / 90) * (0.4 + density));
        for (let k = 0; k < spawns; k++) {
            const x = rng.int(2, cols - 3);
            const y = rng.int(2, rows - 3);
            const dir = rng.int(0, 3) * 2;
            const width = rng.chance(0.35) ? rng.int(2, 6) : 1;
            const [px, py] = DIRS[(dir + 2) % 8]!;
            const starts = Array.from({length: width}, (_, i) => [x + px * i * 2, y + py * i * 2] as Point);
            const lit = rng.chance(0.18);
            const color = lit || rng.chance(0.15) ? rng.pick(accents) : null;
            addBus(routeBus(board, rng, starts, dir, rng.int(6, 40)), color, lit);
        }

        // 4. Draw. Everything lives in cell units under one transform, so coordinates stay small integers.
        const unit = (name: AccentName | null, lit: boolean) =>
            name === null ? c.lineStrong : lit ? c.ink(name) : mix(c.base, c.ink(name), c.dark ? 0.45 : 0.4);
        const groups = new Map<string, Trace[]>();
        for (const t of traces) {
            const key = `${t.color ?? ""}|${t.lit ? 1 : 0}`;
            groups.set(key, [...(groups.get(key) ?? []), t]);
        }
        const keys = [...groups.keys()].sort(
            (a, b) => Number(a.endsWith("1")) - Number(b.endsWith("1")) || a.localeCompare(b),
        );
        const layers: string[] = [];
        for (const key of keys) {
            const list = groups.get(key)!;
            const name = (key.split("|")[0] || null) as AccentName | null;
            const lit = key.endsWith("1");
            const stroke = unit(name, lit);
            const d = list
                .map((t) => t.points.map(([x, y], i) => `${i ? "L" : "M"}${n(x, 2)} ${n(y, 2)}`).join(""))
                .join("");
            const via = ([x, y]: Point) => el("circle", {cx: n(x, 2), cy: n(y, 2), r: ".38"});
            const ends = list.flatMap((t) => {
                const out = t.startVia ? [via(t.points[0]!)] : [];
                const last = t.points[t.points.length - 1]!;
                if (t.end === "via") {
                    out.push(via(last));
                } else if (t.end === "pad") {
                    out.push(el("rect", {x: n(last[0] - 0.4, 2), y: n(last[1] - 0.4, 2), width: ".8", height: ".8"}));
                }
                return out;
            });
            layers.push(
                el("g", {filter: lit && c.dark ? "url(#glow)" : undefined}, [
                    el("path", {
                        d,
                        fill: "none",
                        stroke,
                        "stroke-width": lit ? ".24" : ".18",
                        "stroke-linejoin": "round",
                        "stroke-linecap": "round",
                    }),
                    el("g", {fill: c.base, stroke, "stroke-width": ".16"}, ends),
                ]),
            );
        }

        const chipShapes = chips.map((chip) => {
            const pins: string[] = [];
            for (let y = chip.y + 1; y < chip.y + chip.h; y += 2) {
                pins.push(`M${chip.x - 0.35} ${y}h.35M${chip.x + chip.w} ${y}h.35`);
            }
            for (let x = chip.x + 1; x < chip.x + chip.w; x += 2) {
                pins.push(`M${x} ${chip.y - 0.35}v.35M${x} ${chip.y + chip.h}v.35`);
            }
            const ink = c.ink(chip.color);
            const inset = Math.min(chip.w, chip.h) * 0.28;
            return el("g", {}, [
                el("path", {d: pins.join(""), stroke: c.lineStrong, "stroke-width": ".5"}),
                el("rect", {
                    x: String(chip.x),
                    y: String(chip.y),
                    width: String(chip.w),
                    height: String(chip.h),
                    rx: ".3",
                    fill: c.surface,
                    stroke: c.lineStrong,
                    "stroke-width": ".12",
                }),
                el("rect", {
                    x: n(chip.x + inset, 2),
                    y: n(chip.y + inset, 2),
                    width: n(chip.w - inset * 2, 2),
                    height: n(chip.h - inset * 2, 2),
                    fill: "none",
                    stroke: ink,
                    "stroke-width": ".14",
                    "stroke-opacity": ".8",
                }),
                el("circle", {cx: n(chip.x + 0.8, 2), cy: n(chip.y + 0.8, 2), r: ".22", fill: ink}),
            ]);
        });

        const main = chips[0];
        const gx = main ? offX + (main.x + main.w / 2) * cell : w / 2;
        const gy = main ? offY + (main.y + main.h / 2) * cell : h / 2;
        return {
            defs: [
                glowFilter("glow", 0.35, 1.2),
                radialGradient(
                    "glow-bg",
                    gx,
                    gy,
                    Math.max(w, h) * 0.6,
                    fade(c.fill(accents[0]!), c.dark ? 0.14 : 0.08, 8),
                ),
            ],
            body: [
                el("rect", {width: w, height: h, fill: c.base}),
                el("rect", {width: w, height: h, fill: "url(#glow-bg)"}),
                el("g", {transform: `translate(${n(offX, 2)} ${n(offY, 2)}) scale(${n(cell, 3)})`}, [
                    ...layers,
                    ...chipShapes,
                ]),
            ],
        };
    },
};

function range(from: number, to: number, step: number): number[] {
    const out: number[] = [];
    for (let v = from; v <= to; v += step) {
        out.push(v);
    }
    return out;
}

export const circuits: Generator[] = [circuit];
