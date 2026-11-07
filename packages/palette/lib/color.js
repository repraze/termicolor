import { clampChroma, converter, formatHex, interpolate, parse, wcagContrast } from "culori";
const toOklch = converter("oklch");
const toRgb = converter("rgb");
function parseHex(hex) {
    const color = parse(hex);
    if (!color) {
        throw new TypeError(`Invalid color "${hex}"`);
    }
    return color;
}
export function oklch(hex) {
    const { l, c, h } = toOklch(parseHex(hex));
    return { l, c, h: h ?? 0 };
}
/** Builds a color from OKLCH, reducing chroma until it fits in sRGB. */
export function fromOklch({ l, c, h }) {
    const value = { mode: "oklch", l: Math.min(Math.max(l, 0), 1), c, h };
    return formatHex(clampChroma(value, "oklch"));
}
export function rgb(hex) {
    const { r, g, b } = toRgb(parseHex(hex));
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
/** WCAG 2 contrast ratio (1-21). */
export function contrast(a, b) {
    return wcagContrast(parseHex(a), parseHex(b));
}
/** Appends an alpha channel (0-1) to an opaque hex color. */
export function alpha(hex, value) {
    const base = hex.slice(0, 7);
    return `${base}${Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")}`;
}
/** Mixes `from` toward `to` in OKLab; `t` = 0 returns `from`, 1 returns `to`. */
export function mix(from, to, t) {
    return formatHex(interpolate([parseHex(from), parseHex(to)], "oklab")(t));
}
/** Flattens a `#rrggbbaa` color over an opaque background (for apps without alpha support). */
export function flatten(hex, background) {
    if (hex.length !== 9) {
        return hex;
    }
    return mix(background, hex.slice(0, 7), parseInt(hex.slice(7), 16) / 255);
}
