export const ACCENTS = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink"];
export const MODES = ["dark", "light"];
/**
 * Hand-tuned dark accents - the brand values used on repraze.com. Every other color in the
 * system is derived from these by the rules in `derive.ts`.
 */
export const DARK_ACCENTS = {
    red: "#ff4c82",
    orange: "#ff9243",
    yellow: "#f2c224",
    green: "#35e0a3",
    cyan: "#2edfeb",
    blue: "#4d91ff",
    purple: "#bb7aff",
    pink: "#ff60d4",
};
/**
 * Default accent of every generated port: cursor, selection, focus and buttons. Overridable per
 * consumer with `createPalette({accent})` or the `.accent-<name>` CSS classes. (The site itself
 * uses red, see packages/site/src/hooks/use-theme.ts.)
 */
export const DEFAULT_ACCENT = "purple";
/**
 * Pure grey ramp (Tailwind neutral). Shared by both modes - roles pick from it. No tint is
 * part of the techy look.
 */
export const NEUTRALS = {
    0: "#ffffff",
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
    1000: "#000000",
};
/** Derivation knobs. Changing one of these re-derives the whole system. */
export const RULES = {
    /** Dark brights: same hue and chroma, pushed lighter. */
    darkBrightLightness: 0.06,
    /** Light accents must reach this contrast on white (text-safe with margin over 4.5). */
    lightAccentContrast: 4.55,
    /** Light accents may carry slightly more chroma than dark seeds to stay vivid when darkened. */
    lightChromaBoost: 1.4,
    /**
     * Per-accent hue shift for light mode (degrees). Darkened yellow turns olive at its dark
     * hue; nudging it warmer keeps it reading as amber/gold.
     */
    lightHueShift: { yellow: -20, orange: -4 },
    /** Light brights (ANSI 9-14): lighter than the light accent - conventional, used for emphasis. */
    lightBrightLightness: 0.07,
    /** Text on a solid accent fill must reach this contrast. */
    onAccentContrast: 4.5,
    /** Tints: opaque accent washes for badges, diff lines and selected rows (share of accent over bg). */
    tint: { dark: 0.16, light: 0.12 },
    /** High contrast tints: stronger, so a tinted state reads on the single flat surface. */
    tintHighContrast: { dark: 0.42, light: 0.22 },
    /** ANSI faint/dim: each ANSI color mixed this far toward bg. */
    dim: 0.4,
};
