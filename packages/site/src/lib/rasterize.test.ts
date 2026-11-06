import {describe, expect, it} from "vitest";

import {sizeSvg} from "./rasterize";

describe("sizeSvg", () => {
    it("replaces the pixel size and keeps the viewBox", () => {
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 2560 1440"><rect/></svg>';
        expect(sizeSvg(svg, 3840, 2160)).toBe(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440" width="3840" height="2160"><rect/></svg>',
        );
    });

    it("adds a size when there was none", () => {
        expect(sizeSvg('<svg viewBox="0 0 10 10"></svg>', 20, 10)).toBe(
            '<svg viewBox="0 0 10 10" width="20" height="10"></svg>',
        );
    });
});
