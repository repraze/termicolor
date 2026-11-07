/** Lowercase `#rrggbb`, or `#rrggbbaa` when a color carries alpha. */
export type Hex = string;
export type Rgb = {
    r: number;
    g: number;
    b: number;
};
export type OklchValue = {
    l: number;
    c: number;
    h: number;
};
export declare function oklch(hex: Hex): OklchValue;
/** Builds a color from OKLCH, reducing chroma until it fits in sRGB. */
export declare function fromOklch({ l, c, h }: OklchValue): Hex;
export declare function rgb(hex: Hex): Rgb;
/** WCAG 2 contrast ratio (1-21). */
export declare function contrast(a: Hex, b: Hex): number;
/** Appends an alpha channel (0-1) to an opaque hex color. */
export declare function alpha(hex: Hex, value: number): Hex;
/** Mixes `from` toward `to` in OKLab; `t` = 0 returns `from`, 1 returns `to`. */
export declare function mix(from: Hex, to: Hex, t: number): Hex;
/** Flattens a `#rrggbbaa` color over an opaque background (for apps without alpha support). */
export declare function flatten(hex: Hex, background: Hex): Hex;
//# sourceMappingURL=color.d.ts.map