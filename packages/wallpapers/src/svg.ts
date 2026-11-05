/** Minimal SVG string helpers. Numbers are rounded so output stays small and byte-stable. */

export type Attrs = Record<string, string | number | undefined>;

/** Rounds to 0.1 and prints without trailing zeros (and never `-0`). */
export function n(value: number, digits = 1): string {
    const p = 10 ** digits;
    const r = Math.round(value * p) / p;
    return Object.is(r, -0) ? "0" : String(r);
}

export function el(tag: string, attrs: Attrs, children?: string | string[]): string {
    const parts = Object.entries(attrs)
        .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
        .map(([key, value]) => ` ${key}="${typeof value === "number" ? n(value, 2) : value}"`)
        .join("");
    const inner = Array.isArray(children) ? children.join("") : children;
    return inner === undefined || inner === "" ? `<${tag}${parts}/>` : `<${tag}${parts}>${inner}</${tag}>`;
}

/** Polyline points as a compact path: `M1 2L3 4…`. */
export function path(points: readonly (readonly [number, number])[], close = false, digits = 1): string {
    return (
        points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${n(x, digits)} ${n(y, digits)}`).join("") + (close ? "Z" : "")
    );
}

export type Stop = {offset: number; color: string; opacity?: number};

export function stops(list: readonly Stop[]): string[] {
    return list.map((s) =>
        el("stop", {
            offset: n(s.offset, 3),
            "stop-color": s.color,
            "stop-opacity": s.opacity === undefined || s.opacity === 1 ? undefined : n(s.opacity, 3),
        }),
    );
}

/** A soft falloff (smoothstep) from `opacity` at the center to 0, so radial glows don't show a hard edge. */
export function fade(color: string, opacity: number, steps = 6): Stop[] {
    return Array.from({length: steps + 1}, (_, i) => {
        const t = i / steps;
        const e = 1 - t * t * (3 - 2 * t);
        return {offset: t, color, opacity: opacity * e};
    });
}

export function linearGradient(id: string, from: [number, number], to: [number, number], list: Stop[]): string {
    return el(
        "linearGradient",
        {id, gradientUnits: "userSpaceOnUse", x1: n(from[0]), y1: n(from[1]), x2: n(to[0]), y2: n(to[1])},
        stops(list),
    );
}

export function radialGradient(id: string, cx: number, cy: number, r: number, list: Stop[], ry?: number): string {
    const attrs: Attrs = {id, gradientUnits: "userSpaceOnUse", cx: n(cx), cy: n(cy), r: n(r)};
    if (ry !== undefined && ry !== r) {
        // Elliptical glow: scale y around the center.
        attrs.gradientTransform = `translate(0 ${n(cy)}) scale(1 ${n(ry / r, 3)}) translate(0 ${n(-cy)})`;
    }
    return el("radialGradient", attrs, stops(list));
}

/** Monochrome film grain, blended over the image to break up 8-bit banding. */
export function grainFilter(id: string, seed: number, frequency: number): string {
    return el("filter", {id, x: "0", y: "0", width: "100%", height: "100%", "color-interpolation-filters": "sRGB"}, [
        el("feTurbulence", {
            type: "fractalNoise",
            baseFrequency: n(frequency, 3),
            numOctaves: "2",
            seed: String(seed % 100000),
            stitchTiles: "stitch",
        }),
        el("feColorMatrix", {
            type: "matrix",
            values: "0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1",
        }),
    ]);
}

/** Gaussian glow: blurred copy of the source merged under the sharp source. */
export function glowFilter(id: string, blur: number, strength = 1): string {
    return el("filter", {id, x: "-20%", y: "-20%", width: "140%", height: "140%"}, [
        el("feGaussianBlur", {in: "SourceGraphic", stdDeviation: n(blur), result: "b"}),
        el("feComponentTransfer", {in: "b", result: "g"}, el("feFuncA", {type: "linear", slope: n(strength, 2)})),
        el("feMerge", {}, [el("feMergeNode", {in: "g"}), el("feMergeNode", {in: "SourceGraphic"})]),
    ]);
}

export function blurFilter(id: string, blur: number): string {
    return el(
        "filter",
        {id, x: "-50%", y: "-50%", width: "200%", height: "200%"},
        el("feGaussianBlur", {stdDeviation: n(blur)}),
    );
}

export function document(width: number, height: number, title: string, defs: string[], body: string[]): string {
    return `${[
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        `<title>${title}</title>`,
        defs.length ? `<defs>${defs.join("")}</defs>` : "",
        ...body,
        "</svg>",
    ]
        .filter(Boolean)
        .join("\n")}\n`;
}
