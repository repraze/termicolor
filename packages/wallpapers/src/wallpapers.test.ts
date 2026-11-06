import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {palette} from "@termicolor/palette";
import {test} from "vitest";

import {CATALOG, renderCatalog} from "./catalog.ts";
import {createRng} from "./random.ts";
import {GENERATORS, renderWallpaper, SIZES} from "./render.ts";

const uhd = SIZES.uhd;

test("rng: same seed, same sequence", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({length: 50}, () => a.next());
    assert.deepEqual(
        seqA,
        Array.from({length: 50}, () => b.next()),
    );
    assert.notDeepEqual(
        seqA,
        Array.from({length: 50}, () => createRng(43).next()),
    );
    assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

for (const generator of GENERATORS) {
    test(`${generator.id}: same seed renders identical bytes`, () => {
        for (const mode of ["dark", "light"] as const) {
            const first = renderWallpaper({generator: generator.id, seed: 7}, {palette, mode, size: uhd});
            const second = renderWallpaper({generator: generator.id, seed: 7}, {palette, mode, size: uhd});
            assert.equal(first, second);
        }
    });

    test(`${generator.id}: a different seed changes the output`, () => {
        const a = renderWallpaper({generator: generator.id, seed: 1}, {palette, mode: "dark", size: uhd});
        const b = renderWallpaper({generator: generator.id, seed: 2}, {palette, mode: "dark", size: uhd});
        assert.notEqual(a, b);
    });

    test(`${generator.id}: every size renders well-formed SVG`, () => {
        for (const size of Object.values(SIZES)) {
            const svg = renderWallpaper({generator: generator.id, seed: 3}, {palette, mode: "light", size});
            assert.match(svg, new RegExp(`^<svg [^>]*width="${size.width}" height="${size.height}"`));
            assert.ok(svg.endsWith("</svg>\n"));
            assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
        }
    });
}

test("catalog ids are unique and every file stays small", () => {
    const ids = CATALOG.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const file of renderCatalog(palette)) {
        assert.ok(file.contents.length < 48 * 1024, `${file.path} is ${file.contents.length} bytes`);
    }
});

test("CATALOG.md documents every generator and kept seed", () => {
    const doc = readFileSync(new URL("../CATALOG.md", import.meta.url), "utf8");
    for (const generator of GENERATORS) {
        assert.ok(doc.includes(`\`${generator.id}\``), `generator ${generator.id} missing from CATALOG.md`);
    }
    for (const entry of CATALOG) {
        assert.ok(doc.includes(`\`${entry.id}\``), `${entry.id} missing from CATALOG.md`);
    }
});
