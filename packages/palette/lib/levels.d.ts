import { type Hex } from "./color.ts";
/**
 * The only strengths a port may derive with (DESIGN.md §13). The palette stores real choices; every
 * see-through or blended variant is one of these levels applied to an existing color, so "a bit of
 * accent behind text" means the same thing in every app.
 */
export declare const LEVELS: {
    /** hover washes, barely-there highlights */
    readonly faint: 0.06;
    /** inactive selection, line highlights, diff lines */
    readonly subtle: 0.15;
    /** selection, word highlights */
    readonly soft: 0.3;
    /** search matches, strong diff words */
    readonly medium: 0.45;
    /** focus rings, emphasis overlays */
    readonly strong: 0.6;
};
export type Level = keyof typeof LEVELS;
/** See-through version of a color, for targets that composite (VS Code, browsers). */
export declare function wash(hex: Hex, level: Level): Hex;
/** A see-through color laid over a surface, for targets without alpha (terminals, TUIs). */
export declare function solid(translucent: Hex, over: Hex): Hex;
/** Opaque blend of a color into a surface at a level: `tint(a.green, "subtle", r.bg)`. */
export declare function tint(hex: Hex, level: Level, over: Hex): Hex;
//# sourceMappingURL=levels.d.ts.map