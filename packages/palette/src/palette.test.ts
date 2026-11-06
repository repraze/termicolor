import assert from "node:assert/strict";

import {test} from "vitest";

import {contrast, oklch} from "./color.ts";
import {allModes, palette} from "./palette.ts";
import {ACCENTS, DARK_ACCENTS, RULES} from "./seeds.ts";
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
        const allowed = Math.abs(RULES.lightHueShift[name] ?? 0) + 4;
        assert.ok(delta <= allowed, `${name} hue drifted ${delta.toFixed(1)}° (allowed ${allowed})`);
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

test("high contrast keeps the accents and syntax of its base mode", () => {
    for (const name of ["dark", "light"] as const) {
        const base = palette.modes[name];
        const hc = palette.highContrast[name];
        assert.equal(hc.id, `${name}-hc`);
        assert.equal(hc.contrast, "high");
        assert.deepEqual(hc.accents, base.accents);
        assert.deepEqual(hc.on, base.on);
    }
});

test("high contrast flattens surfaces and brightens structure", () => {
    for (const name of ["dark", "light"] as const) {
        const base = palette.modes[name].roles;
        const hc = palette.highContrast[name].roles;
        assert.equal(hc.bgSunken, hc.bg, `${name}: page and code boxes share one background`);
        assert.ok(contrast(hc.border, hc.bg) > contrast(base.border, base.bg) * 2, `${name}: borders are not muted`);
        assert.ok(contrast(hc.fg, hc.bg) >= contrast(base.fg, base.bg), `${name}: text contrast never drops`);
    }
});

test("mode ids are unique", () => {
    const ids = allModes().map((m) => m.id);
    assert.deepEqual(ids, ["dark", "light", "dark-hc", "light-hc"]);
});

test("fills are the vivid brand seeds in every mode", () => {
    for (const mode of allModes()) {
        assert.deepEqual(mode.fills, DARK_ACCENTS, mode.id);
    }
});

test("light text accents are as vivid as the contrast floor allows", () => {
    for (const name of ACCENTS) {
        const {c} = oklch(palette.modes.light.accents[name]);
        assert.ok(c >= 0.11 || name === "cyan", `${name} chroma ${c.toFixed(3)}`);
    }
});

test("solid roles are opaque", () => {
    for (const mode of allModes()) {
        const r = mode.roles;
        for (const hex of [
            r.selectionSolid,
            r.selectionInactiveSolid,
            r.findMatchSolid,
            r.addedTint,
            ...Object.values(mode.tints),
        ]) {
            assert.equal(hex.length, 7, `${mode.id} ${hex}`);
        }
    }
});
