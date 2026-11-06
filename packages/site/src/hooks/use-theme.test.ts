import {describe, expect, it} from "vitest";

import {modeId, themeClasses} from "./use-theme";

describe("theme classes", () => {
    it("sets exactly one scheme class", () => {
        expect(themeClasses("dark", "normal")).toMatchObject({light: false, dark: true, hc: false});
        expect(themeClasses("light", "high")).toMatchObject({light: true, dark: false, hc: true});
    });

    it("sets exactly one accent class, red by default", () => {
        const on = (c: Record<string, boolean>) => Object.keys(c).filter((k) => k.startsWith("accent-") && c[k]);
        expect(on(themeClasses("dark", "normal"))).toEqual(["accent-red"]);
        expect(on(themeClasses("dark", "normal", "pink"))).toEqual(["accent-pink"]);
    });

    it("maps to palette mode ids", () => {
        expect(modeId("dark", "normal")).toBe("dark");
        expect(modeId("light", "high")).toBe("light-hc");
    });
});
