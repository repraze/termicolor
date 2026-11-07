import type { Hex } from "./color.ts";
export declare const ACCENTS: readonly ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
export type AccentName = (typeof ACCENTS)[number];
export declare const MODES: readonly ["dark", "light"];
export type ModeName = (typeof MODES)[number];
/**
 * Hand-tuned dark accents - the brand values used on repraze.com. Every other color in the
 * system is derived from these by the rules in `derive.ts`.
 */
export declare const DARK_ACCENTS: Record<AccentName, Hex>;
/**
 * Default accent of every generated port: cursor, selection, focus and buttons. Overridable per
 * consumer with `createPalette({accent})` or the `.accent-<name>` CSS classes. (The site itself
 * uses red, see packages/site/src/hooks/use-theme.ts.)
 */
export declare const DEFAULT_ACCENT: AccentName;
/**
 * Pure grey ramp (Tailwind neutral). Shared by both modes - roles pick from it. No tint is
 * part of the techy look.
 */
export declare const NEUTRALS: {
    readonly 0: "#ffffff";
    readonly 50: "#fafafa";
    readonly 100: "#f5f5f5";
    readonly 200: "#e5e5e5";
    readonly 300: "#d4d4d4";
    readonly 400: "#a3a3a3";
    readonly 500: "#737373";
    readonly 600: "#525252";
    readonly 700: "#404040";
    readonly 800: "#262626";
    readonly 900: "#171717";
    readonly 950: "#0a0a0a";
    readonly 1000: "#000000";
};
export type NeutralStep = keyof typeof NEUTRALS;
/** Derivation knobs. Changing one of these re-derives the whole system. */
export declare const RULES: {
    /** Dark brights: same hue and chroma, pushed lighter. */
    darkBrightLightness: number;
    /** Light accents must reach this contrast on white (text-safe with margin over 4.5). */
    lightAccentContrast: number;
    /** Light accents may carry slightly more chroma than dark seeds to stay vivid when darkened. */
    lightChromaBoost: number;
    /**
     * Per-accent hue shift for light mode (degrees). Darkened yellow turns olive at its dark
     * hue; nudging it warmer keeps it reading as amber/gold.
     */
    lightHueShift: Partial<Record<AccentName, number>>;
    /** Light brights (ANSI 9-14): lighter than the light accent - conventional, used for emphasis. */
    lightBrightLightness: number;
    /** Text on a solid accent fill must reach this contrast. */
    onAccentContrast: number;
    /** Tints: opaque accent washes for badges, diff lines and selected rows (share of accent over bg). */
    tint: {
        dark: number;
        light: number;
    };
    /** High contrast tints: stronger, so a tinted state reads on the single flat surface. */
    tintHighContrast: {
        dark: number;
        light: number;
    };
    /** ANSI faint/dim: each ANSI color mixed this far toward bg. */
    dim: number;
};
//# sourceMappingURL=seeds.d.ts.map