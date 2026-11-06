import {type AccentName, ACCENTS} from "@termicolor/palette";

import {createRng} from "./random.ts";

/**
 * Color harmonies on the accent wheel. `ACCENTS` is in hue order (red → orange → … → pink → back to
 * red), 8 steps of roughly 45°, so each recipe is a list of steps from the lead.
 */
export const HARMONIES = {
    /** The lead alone: one hue on neutral. */
    mono: [0],
    /** The lead and both neighbours (±45°): calm, cohesive. */
    analogous: [0, 1, -1],
    /** The lead and the next two hues one way (0°, 45°, 90°): a sweep, good for ramps. */
    sweep: [0, 1, 2],
    /** The lead and its opposite (180°): maximum contrast. */
    complementary: [0, 4],
    /** The lead and the two hues beside its opposite (±135°): contrast with less clash. */
    split: [0, 3, 5],
    /** Four hues 90° apart: the loudest, for busy patterns. */
    tetrad: [0, 2, 4, 6],
} as const satisfies Record<string, readonly number[]>;
export type HarmonyName = keyof typeof HARMONIES;
export const HARMONY_NAMES = Object.keys(HARMONIES) as HarmonyName[];

export function harmony(lead: AccentName, name: HarmonyName): AccentName[] {
    const at = ACCENTS.indexOf(lead);
    return HARMONIES[name].map((step) => ACCENTS[(at + step + ACCENTS.length) % ACCENTS.length]!);
}

export type AccentChoice = {lead: AccentName; harmony: HarmonyName; accents: AccentName[]};

/**
 * Picks lead and harmony from the seed, on its own RNG stream (`<generator>:<seed>:color`) so the
 * composition stream is untouched: re-coloring never moves shapes. `lead` / `harmony` pin either half.
 */
export function chooseAccents(
    generator: string,
    seed: number,
    allowed: readonly HarmonyName[],
    pin: {lead?: AccentName; harmony?: HarmonyName} = {},
): AccentChoice {
    const rng = createRng(`${generator}:${seed}:color`);
    const lead = rng.pick(ACCENTS);
    const name = rng.pick(allowed);
    const chosen = {lead: pin.lead ?? lead, harmony: pin.harmony ?? name};
    return {...chosen, accents: harmony(chosen.lead, chosen.harmony)};
}
