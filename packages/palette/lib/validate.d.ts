import { type Hex } from "./color.ts";
import { type Mode, type Palette } from "./palette.ts";
export type Check = {
    mode: string;
    label: string;
    fg: Hex;
    bg: Hex;
    ratio: number;
    min: number;
    pass: boolean;
};
/** The contrast guarantees behind "high contrast". Build fails if any of these regress. */
export declare function checkMode(mode: Mode): Check[];
export declare function checkPalette(palette: Palette): Check[];
//# sourceMappingURL=validate.d.ts.map