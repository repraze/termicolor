import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {ACCENTS, palette} from "@repraze/termicolor";
import {test} from "vitest";

import {CATALOG, leadCounts} from "./catalog.ts";
import {replaceCatalogTable} from "./catalog-doc.ts";
import {chooseAccents, harmony, HARMONY_NAMES} from "./harmony.ts";
import {GENERATORS, renderWallpaper, resolveSpec, SIZES} from "./render.ts";

/**
 * The seeded color choice of every kept wallpaper. Changing the color RNG, a generator's harmony list
 * or a catalog seed shows up here: update it deliberately, then rerun the build.
 */
const LEADS: Record<string, string> = {
    "linear-1": "cyan complementary",
    "linear-3": "blue analogous",
    "radial-2": "pink complementary",
    "radial-4": "purple split",
    "conic-7": "yellow sweep",
    "conic-10": "green split",
    "mesh-9": "orange tetrad",
    "mesh-22": "red split",
    "mesh-1": "blue analogous",
    "aurora-4": "pink analogous",
    "aurora-3": "red split",
    "noise-2": "yellow analogous",
    "noise-3": "green complementary",
    "posterize-2": "orange analogous",
    "bands-2": "cyan sweep",
    "bands-33": "purple tetrad",
    "stripes-1": "blue complementary",
    "stripes-2": "orange analogous",
    "moire-1": "purple analogous",
    "moire-4": "green complementary",
    "waves-3": "yellow analogous",
    "waves-4": "red complementary",
    "contours-1": "pink sweep",
    "contours-8": "cyan split",
    "flow-1": "blue tetrad",
    "flow-2": "cyan sweep",
    "glitch-2": "red analogous",
    "glitch-7": "pink complementary",
    "blueprint-2": "orange split",
    "dots-3": "green analogous",
    "halftone-13": "yellow complementary",
    "halftone-30": "purple sweep",
    "plaid-1": "pink tetrad",
    "plaid-2": "red analogous",
    "truchet-1": "yellow mono",
    "maze-4": "cyan sweep",
    "cells-4": "green tetrad",
    "cells-5": "purple split",
    "traces-1": "blue split",
    "traces-9": "orange analogous",
};

test("seeded lead + harmony per kept seed is stable", () => {
    const actual = Object.fromEntries(
        CATALOG.map((e) => {
            const r = resolveSpec(e);
            return [e.id, `${r.lead} ${r.harmony}`];
        }),
    );
    assert.deepEqual(actual, LEADS);
});

test("every accent leads, and evenly, across the kept catalog", () => {
    const counts = leadCounts();
    assert.deepEqual(Object.keys(counts).sort(), [...ACCENTS].sort());
    const even = CATALOG.length / ACCENTS.length;
    for (const accent of ACCENTS) {
        assert.equal(counts[accent], even, `${accent} leads ${counts[accent]}`);
    }
});

test("harmonies walk the hue wheel from the lead", () => {
    assert.deepEqual(harmony("red", "complementary"), ["red", "cyan"]);
    assert.deepEqual(harmony("red", "analogous"), ["red", "orange", "pink"]);
    assert.deepEqual(harmony("pink", "sweep"), ["pink", "red", "orange"]);
    assert.deepEqual(harmony("blue", "split"), ["blue", "red", "yellow"]);
    assert.deepEqual(harmony("green", "tetrad"), ["green", "blue", "pink", "orange"]);
    for (const name of HARMONY_NAMES) {
        assert.equal(harmony("yellow", name)[0], "yellow");
    }
});

test("the color choice is a pure function of generator + seed", () => {
    for (const generator of GENERATORS) {
        for (const seed of [1, 2, 99]) {
            const a = chooseAccents(generator.id, seed, generator.harmonies);
            assert.deepEqual(a, chooseAccents(generator.id, seed, generator.harmonies));
            assert.ok(generator.harmonies.includes(a.harmony), `${generator.id} picked ${a.harmony}`);
        }
    }
});

test("explicit accents override the seed; lead and harmony pin either half", () => {
    const pinned = resolveSpec({generator: "flow", seed: 2, params: {accents: ["green", "blue"]}});
    assert.deepEqual(pinned.params.accents, ["green", "blue"]);
    assert.equal(pinned.harmony, "custom");
    const lead = resolveSpec({generator: "flow", seed: 2, params: {lead: "red"}});
    assert.equal(lead.lead, "red");
    assert.equal(lead.harmony, resolveSpec({generator: "flow", seed: 2}).harmony);
    const both = resolveSpec({generator: "flow", seed: 2, params: {lead: "red", harmony: "complementary"}});
    assert.deepEqual(both.params.accents, ["red", "cyan"]);
});

test("re-coloring never moves shapes: colors use their own RNG stream", () => {
    const size = SIZES.qhd;
    const shapes = (svg: string) => svg.replace(/#[0-9a-f]{6}([0-9a-f]{2})?/g, "#").replace(/tableValues="[^"]*"/g, "");
    for (const generator of ["flow", "waves", "traces", "contours"]) {
        const a = renderWallpaper({generator, seed: 3, params: {lead: "red"}}, {palette, mode: "dark", size});
        const b = renderWallpaper({generator, seed: 3, params: {lead: "blue"}}, {palette, mode: "dark", size});
        assert.notEqual(a, b);
        assert.equal(shapes(a), shapes(b), generator);
    }
});

test("CATALOG.md's kept-seed table matches the catalog (npm run catalog -w @termicolor/wallpapers)", () => {
    const doc = readFileSync(new URL("../CATALOG.md", import.meta.url), "utf8");
    assert.equal(replaceCatalogTable(doc), doc);
});
