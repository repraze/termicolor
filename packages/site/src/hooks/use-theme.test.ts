import {describe, expect, it} from "vitest";

import {modeId, themeClasses} from "./use-theme";

describe("theme classes", () => {
    it("sets exactly one scheme class", () => {
        expect(themeClasses("dark", "normal")).toEqual({light: false, dark: true, hc: false});
        expect(themeClasses("light", "high")).toEqual({light: true, dark: false, hc: true});
    });

    it("maps to palette mode ids", () => {
        expect(modeId("dark", "normal")).toBe("dark");
        expect(modeId("light", "high")).toBe("light-hc");
    });
});
