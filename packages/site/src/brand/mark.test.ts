import {readFileSync} from "node:fs";

import {palette} from "@repraze/termicolor";
import {describe, expect, it} from "vitest";

import {MARK_COLORS, MARK_SHAPES, markSvg} from "./mark";

/** Every coordinate and radius in a path, without the arc flags. */
const numbers = (d: string) =>
    d
        .replace(/A(\d+) (\d+) 0 0 1/g, "A$1 $2")
        .match(/-?\d+(\.\d+)?/g)!
        .map(Number);

describe("brand mark", () => {
    it("sits on the even-unit grid, so 16px and 32px renders land on whole pixels", () => {
        for (const {d} of MARK_SHAPES) {
            for (const n of numbers(d)) {
                expect(n % 2, `${n} in ${d}`).toBe(0);
            }
        }
    });

    it("stays inside the 32-unit viewBox with a 2-unit margin", () => {
        for (const n of MARK_SHAPES.flatMap(({d}) => numbers(d))) {
            expect(n).toBeGreaterThanOrEqual(2);
            expect(n).toBeLessThanOrEqual(30);
        }
    });

    it("takes its colors from the dark palette, with the red accent as the outline", () => {
        expect(MARK_COLORS.outline).toBe(palette.modes.dark.accents.red);
        expect(markSvg()).toContain(`fill="${palette.modes.dark.accents.red}"`);
    });

    it("sizes in px only when asked", () => {
        expect(markSvg()).not.toContain("width=");
        expect(markSvg({size: 512})).toContain('width="512" height="512"');
    });

    it("matches the checked-in favicon (regenerate with npx tsx scripts/brand.ts)", () => {
        const favicon = readFileSync(new URL("../../public/favicon.svg", import.meta.url), "utf8");
        expect(favicon.trim()).toBe(markSvg());
    });
});
