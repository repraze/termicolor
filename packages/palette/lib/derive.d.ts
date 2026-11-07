import { type Hex } from "./color.ts";
import { type AccentName } from "./seeds.ts";
export type AccentSet = Record<AccentName, Hex>;
export type DerivedAccents = {
    /** Base accents (ANSI 1-6, syntax, UI). Text-safe on bg. */
    accents: AccentSet;
    /** Vivid solid fills (buttons, badges, swatches, powerline). The brand seeds in both modes. */
    fills: AccentSet;
    /** Text on a fill. */
    onFill: AccentSet;
    /** Bright variants (ANSI 9-14, hover states). */
    brights: AccentSet;
    /** Text color to put on a solid fill of each accent. */
    on: AccentSet;
};
export declare function deriveDark(): DerivedAccents;
export declare function deriveLight(): DerivedAccents;
//# sourceMappingURL=derive.d.ts.map