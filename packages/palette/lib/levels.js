import { alpha, flatten, mix } from "./color.js";
/**
 * The only strengths a port may derive with (DESIGN.md §13). The palette stores real choices; every
 * see-through or blended variant is one of these levels applied to an existing color, so "a bit of
 * accent behind text" means the same thing in every app.
 */
export const LEVELS = {
    /** hover washes, barely-there highlights */
    faint: 0.06,
    /** inactive selection, line highlights, diff lines */
    subtle: 0.15,
    /** selection, word highlights */
    soft: 0.3,
    /** search matches, strong diff words */
    medium: 0.45,
    /** focus rings, emphasis overlays */
    strong: 0.6,
};
/** See-through version of a color, for targets that composite (VS Code, browsers). */
export function wash(hex, level) {
    return alpha(hex, LEVELS[level]);
}
/** A see-through color laid over a surface, for targets without alpha (terminals, TUIs). */
export function solid(translucent, over) {
    return flatten(translucent, over);
}
/** Opaque blend of a color into a surface at a level: `tint(a.green, "subtle", r.bg)`. */
export function tint(hex, level, over) {
    return mix(over, hex, LEVELS[level]);
}
