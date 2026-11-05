import assert from "node:assert/strict";
import {test} from "node:test";

import {contrast, oklch} from "./color.ts";
import {palette} from "./palette.ts";
import {ACCENTS, DARK_ACCENTS} from "./seeds.ts";
import {checkPalette} from "./validate.ts";

test("every contrast guarantee holds", () => {
    const failures = checkPalette(palette).filter((c) => !c.pass);
    assert.deepEqual(
        failures.map((c) => `${c.mode}: ${c.label} ${c.ratio.toFixed(2)} < ${c.min}`),
        [],
    );
});

test("dark accents are the brand seeds", () => {
    assert.deepEqual(palette.modes.dark.accents, DARK_ACCENTS);
});

test("light accents keep the dark hue (within the configured shift)", () => {
    for (const name of ACCENTS) {
        const dark = oklch(palette.modes.dark.accents[name]).h;
        const light = oklch(palette.modes.light.accents[name]).h;
        const delta = Math.abs(((light - dark + 540) % 360) - 180);
        assert.ok(delta <= 14, `${name} hue drifted ${delta.toFixed(1)}°`);
    }
});

test("brights are lighter than their base", () => {
    for (const mode of Object.values(palette.modes)) {
        for (const name of ACCENTS) {
            assert.ok(oklch(mode.brights[name]).l > oklch(mode.accents[name]).l, `${mode.name} ${name}`);
        }
    }
});

test("light accents sit close to the target, not far past it", () => {
    for (const name of ACCENTS) {
        const ratio = contrast(palette.modes.light.accents[name], "#ffffff");
        assert.ok(ratio < 5.5, `${name} is darker than needed (${ratio.toFixed(2)})`);
    }
});
