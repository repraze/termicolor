import {describe, expect, it} from "vitest";

import {SPRITE, SPRITE_COLORS, SPRITE_SIZE, spriteSvg} from "./sprite";

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
        const svg = spriteSvg();
        expect(spriteSvg()).toBe(svg);
        expect(svg).toContain('viewBox="0 0 32 32"');
        expect(svg).toContain('shape-rendering="crispEdges"');
        expect(spriteSvg({scale: 16})).toContain('width="512" height="512"');
    });

    it("merges horizontal runs into one rect each", () => {
        const runs = SPRITE.reduce((count, row) => {
            const matches = row.match(/([^.])\1*/g) ?? [];
            return count + matches.length;
        }, 0);
        expect(spriteSvg().match(/<rect /g)).toHaveLength(runs);
    });

    it("wraps the sprite in a bordered badge", () => {
        const badge = spriteSvg({badge: true});
        expect(badge).toContain('viewBox="0 0 36 36"');
        expect(badge).toMatch(/stroke="#[0-9a-f]{6}"/i);
    });
});
