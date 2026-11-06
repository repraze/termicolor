import {contrast, fromOklch, type Hex, oklch} from "./color.ts";
import {type AccentName, ACCENTS, DARK_ACCENTS, NEUTRALS, RULES} from "./seeds.ts";

export type AccentSet = Record<AccentName, Hex>;

function mapAccents(fn: (name: AccentName) => Hex): AccentSet {
    return Object.fromEntries(ACCENTS.map((name) => [name, fn(name)])) as AccentSet;
}

/** Largest chroma that keeps `l`/`h` inside sRGB. */
function maxChroma(l: number, h: number): number {
    let lo = 0;
    let hi = 0.4;
    for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        const {c} = oklch(fromOklch({l, c: mid, h}));
        if (c >= mid - 0.002) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    return lo;
}

function lighten(hex: Hex, amount: number): Hex {
    const {l, c, h} = oklch(hex);
    return fromOklch({l: Math.min(l + amount, 0.95), c, h});
}

/** Darkens a seed (same hue, optional shift) until it reaches `target` contrast on `background`. */
function darkenToContrast(seed: Hex, target: number, background: Hex, hueShift = 0): Hex {
    const {l: seedL, c: seedC, h: seedH} = oklch(seed);
    const h = (seedH + hueShift + 360) % 360;
    for (let l = seedL; l > 0.2; l -= 0.002) {
        const hex = fromOklch({l, c: Math.min(seedC * RULES.lightChromaBoost, maxChroma(l, h)), h});
        if (contrast(hex, background) >= target) {
            return hex;
        }
    }
    throw new Error(`Cannot reach contrast ${target} for ${seed}`);
}

/**
 * Readable text for a solid accent fill: white when it clears the target, otherwise a very
 * dark tint of the same hue (keeps the pairing "on brand" instead of plain black).
 */
function onColor(accent: Hex): Hex {
    if (contrast("#ffffff", accent) >= RULES.onAccentContrast) {
        return "#ffffff";
    }
    const {h} = oklch(accent);
    return fromOklch({l: 0.2, c: 0.04, h});
}

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

export function deriveDark(): DerivedAccents {
    const accents = {...DARK_ACCENTS};
    return {
        accents,
        fills: accents,
        onFill: mapAccents((n) => onColor(accents[n])),
        brights: mapAccents((n) => lighten(accents[n], RULES.darkBrightLightness)),
        on: mapAccents((n) => onColor(accents[n])),
    };
}

export function deriveLight(): DerivedAccents {
    const accents = mapAccents((n) =>
        // against bgSunken (n50), the darkest light surface text sits on, so text is safe on every surface
        darkenToContrast(DARK_ACCENTS[n], RULES.lightAccentContrast, NEUTRALS[50], RULES.lightHueShift[n]),
    );
    return {
        accents,
        fills: {...DARK_ACCENTS},
        onFill: mapAccents((n) => onColor(DARK_ACCENTS[n])),
        brights: mapAccents((n) => lighten(accents[n], RULES.lightBrightLightness)),
        on: mapAccents((n) => onColor(accents[n])),
    };
}
