import {readFileSync} from "node:fs";

import {palette} from "@repraze/termicolor";
import {describe, expect, it} from "vitest";

import {outlineCells, SPRITE, SPRITE_COLORS, SPRITE_SIZE, spriteSvg} from "./sprite";

describe("brand sprite", () => {
    it("is a 32x32 grid", () => {
        expect(SPRITE).toHaveLength(SPRITE_SIZE);
        for (const row of SPRITE) {
            expect(row).toHaveLength(SPRITE_SIZE);
        }
    });

    it("only uses keys from the color map", () => {
        const keys = new Set(Object.keys(SPRITE_COLORS));
        for (const row of SPRITE) {
            for (const key of row) {
                if (key !== ".") {
                    expect(keys).toContain(key);
                }
            }
        }
    });

    it("resolves every key to a hex color", () => {
        for (const color of Object.values(SPRITE_COLORS)) {
            expect(color).toMatch(/^#[0-9a-f]{6}$/i);
        }
    });

    it("emits a deterministic, crisp, scalable svg", () => {
        const svg = spriteSvg({outline: false});
        expect(spriteSvg({outline: false})).toBe(svg);
        expect(svg).toContain('viewBox="0 0 32 32"');
        expect(svg).toContain('shape-rendering="crispEdges"');
        expect(spriteSvg({scale: 16, outline: false})).toContain('width="512" height="512"');
    });

    it("merges horizontal runs into one rect each", () => {
        const runs = SPRITE.reduce((count, row) => {
            const matches = row.match(/([^.])\1*/g) ?? [];
            return count + matches.length;
        }, 0);
        expect(spriteSvg({outline: false}).match(/<rect /g)).toHaveLength(runs);
    });

    it("leads with the red accent for the glow", () => {
        const {accents, brights} = palette.modes.dark;
        expect(SPRITE_COLORS.r).toBe(accents.red);
        expect(SPRITE_COLORS.R).toBe(brights.red);
        expect(SPRITE.join("")).toContain("RRRRRRRR");
    });

    it("rings the silhouette in white within a 1px margin", () => {
        const svg = spriteSvg();
        expect(svg).toContain('viewBox="0 0 34 34"');
        expect(svg).toContain(`fill="${palette.modes.dark.neutrals[0]}"`);
        const cells = outlineCells();
        expect(cells.length).toBeGreaterThan(0);
        for (const [x, y] of cells) {
            expect(SPRITE[y]?.[x] ?? ".").toBe(".");
            expect(x).toBeGreaterThanOrEqual(-1);
            expect(y).toBeLessThan(SPRITE_SIZE);
        }
    });

    it("wraps the sprite in a red-bordered badge", () => {
        const badge = spriteSvg({badge: true});
        expect(badge).toContain('viewBox="0 0 36 36"');
        expect(badge).toContain(`stroke="${palette.modes.dark.fills.red}"`);
    });

    it("matches the checked-in favicon (regenerate with npx tsx scripts/brand.ts)", () => {
        const favicon = readFileSync(new URL("../../public/favicon.svg", import.meta.url), "utf8");
        expect(favicon.trim()).toBe(spriteSvg());
    });
});
