/**
 * TermiColor brand mark: a robot skull with angled red eyes and a 2-4-2 grin, drawn as one silhouette with
 * a 2-unit red outline around a dark body (the suite's mark style, shared with KernelKit's monitor).
 *
 * Grid: a 32-unit viewBox where every edge, radius and gap is an even number of units, so the mark lands on
 * whole pixels at 16px (favicon) and 32px (navbar, retina favicon) and stays sharp at multiples of 32.
 * Every color is resolved from the dark palette mode; nothing is hardcoded.
 */
import {palette} from "@repraze/termicolor";

const dark = palette.modes.dark;

export const MARK_COLORS = {
    outline: dark.accents.red,
    body: dark.neutrals[900],
    eyes: dark.accents.red,
    teeth: dark.neutrals[50],
} as const;

/** Each shape: an even-unit path and the color key it fills with, back to front. */
export const MARK_SHAPES: readonly {d: string; fill: keyof typeof MARK_COLORS}[] = [
    // silhouette: a domed cranium (6-unit radius) stepping in at the cheekbones to a narrower jaw
    {
        d: "M8 2H24A6 6 0 0 1 30 8V20A2 2 0 0 1 28 22H26V28A2 2 0 0 1 24 30H8A2 2 0 0 1 6 28V22H4A2 2 0 0 1 2 20V8A6 6 0 0 1 8 2Z",
        fill: "outline",
    },
    // the body, inset 2 units
    {d: "M8 4H24A4 4 0 0 1 28 8V20H24V28H8V20H4V8A4 4 0 0 1 8 4Z", fill: "body"},
    // angled eyes, 2 units from the outline
    {d: "M6 8H12L14 10V14H6Z", fill: "eyes"},
    {d: "M26 8H20L18 10V14H26Z", fill: "eyes"},
    // a 2-4-2 grin: three teeth centered on even units
    {d: "M10 18H12V24H10Z", fill: "teeth"},
    {d: "M14 18H18V24H14Z", fill: "teeth"},
    {d: "M20 18H22V24H20Z", fill: "teeth"},
];

/** The mark as SVG markup. `size` sets width/height in px (omit to let CSS size it). */
export function markSvg({size}: {size?: number} = {}): string {
    const dims = size ? ` width="${size}" height="${size}"` : "";
    const paths = MARK_SHAPES.map((s) => `<path d="${s.d}" fill="${MARK_COLORS[s.fill]}"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"${dims}>${paths}</svg>`;
}
