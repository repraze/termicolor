import { contrast, fromOklch, oklch } from "./color.js";
import { ACCENTS, DARK_ACCENTS, NEUTRALS, RULES } from "./seeds.js";
function mapAccents(fn) {
    return Object.fromEntries(ACCENTS.map((name) => [name, fn(name)]));
}
/** Largest chroma that keeps `l`/`h` inside sRGB. */
function maxChroma(l, h) {
    let lo = 0;
    let hi = 0.4;
    for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        const { c } = oklch(fromOklch({ l, c: mid, h }));
        if (c >= mid - 0.002) {
            lo = mid;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
function lighten(hex, amount) {
    const { l, c, h } = oklch(hex);
    return fromOklch({ l: Math.min(l + amount, 0.95), c, h });
}
/** Darkens a seed (same hue, optional shift) until it reaches `target` contrast on `background`. */
function darkenToContrast(seed, target, background, hueShift = 0) {
    const { l: seedL, c: seedC, h: seedH } = oklch(seed);
    const h = (seedH + hueShift + 360) % 360;
    for (let l = seedL; l > 0.2; l -= 0.002) {
        const hex = fromOklch({ l, c: Math.min(seedC * RULES.lightChromaBoost, maxChroma(l, h)), h });
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
function onColor(accent) {
    if (contrast("#ffffff", accent) >= RULES.onAccentContrast) {
        return "#ffffff";
    }
    const { h } = oklch(accent);
    return fromOklch({ l: 0.2, c: 0.04, h });
}
export function deriveDark() {
    const accents = { ...DARK_ACCENTS };
    return {
        accents,
        fills: accents,
        onFill: mapAccents((n) => onColor(accents[n])),
        brights: mapAccents((n) => lighten(accents[n], RULES.darkBrightLightness)),
        on: mapAccents((n) => onColor(accents[n])),
    };
}
export function deriveLight() {
    const accents = mapAccents((n) => 
    // against bgSunken (n50), the darkest light surface text sits on, so text is safe on every surface
    darkenToContrast(DARK_ACCENTS[n], RULES.lightAccentContrast, NEUTRALS[50], RULES.lightHueShift[n]));
    return {
        accents,
        fills: { ...DARK_ACCENTS },
        onFill: mapAccents((n) => onColor(DARK_ACCENTS[n])),
        brights: mapAccents((n) => lighten(accents[n], RULES.lightBrightLightness)),
        on: mapAccents((n) => onColor(accents[n])),
    };
}
