import {ACCENTS, DEFAULT_THEME, RADII, sanitizeTheme, themeClasses, themeScript} from "@repraze/kernelkit/theme";
import {describe, expect, it} from "vitest";

import {LEGACY_THEME_MIGRATION, modeId, SITE_ACCENT, SITE_THEME, THEME_KEY} from "./use-theme";

/** A Map-backed localStorage, enough for the pre-paint scripts. */
function fakeStorage(entries: Record<string, unknown> = {}) {
    const map = new Map(Object.entries(entries).map(([k, v]) => [k, JSON.stringify(v)]));
    return {
        map,
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => void map.set(k, v),
        removeItem: (k: string) => void map.delete(k),
    };
}

const migrate = (storage: ReturnType<typeof fakeStorage>) =>
    new Function("localStorage", LEGACY_THEME_MIGRATION)(storage);
const stored = (storage: ReturnType<typeof fakeStorage>) => JSON.parse(storage.map.get(THEME_KEY) ?? "null");

describe("site theme defaults", () => {
    it("is brand red with square corners", () => {
        const theme = sanitizeTheme({}, {...DEFAULT_THEME, ...SITE_THEME});
        const on = Object.entries(themeClasses({...theme, mode: "dark"}))
            .filter(([, v]) => v)
            .map(([k]) => k);
        expect(SITE_ACCENT).toBe("red");
        expect(on.filter((c) => c.startsWith("accent-"))).toEqual(["accent-red"]);
        expect(on.filter((c) => c.startsWith("radius-"))).toEqual(["radius-none"]);
        expect(ACCENTS).toContain(SITE_THEME.accent);
        expect(RADII).toContain(SITE_THEME.radius);
    });

    it("bakes the site key and defaults into the pre-paint script", () => {
        const script = themeScript({storageKey: THEME_KEY, defaults: SITE_THEME});
        expect(script).toContain(JSON.stringify(THEME_KEY));
        expect(script).toContain('"accent":"red"');
        expect(script).toContain('"radius":"none"');
    });

    it("maps to palette mode ids", () => {
        expect(modeId("dark", "normal")).toBe("dark");
        expect(modeId("light", "high")).toBe("light-hc");
    });
});

describe("legacy theme migration", () => {
    it("folds the three old keys into one object and removes the old ones", () => {
        const storage = fakeStorage({
            "termicolor-theme": "light",
            "termicolor-contrast": "high",
            "termicolor-accent": "pink",
        });
        migrate(storage);
        expect(stored(storage)).toEqual({mode: "light", contrast: "high", accent: "pink"});
        expect([...storage.map.keys()]).toEqual([THEME_KEY]);
    });

    it("keeps an accent picked without a mode (old defaults were never written)", () => {
        const storage = fakeStorage({"termicolor-accent": "cyan"});
        migrate(storage);
        expect(stored(storage)).toEqual({accent: "cyan"});
    });

    it("leaves the new format and empty storage alone", () => {
        const current = fakeStorage({[THEME_KEY]: {mode: "dark", radius: "lg"}});
        migrate(current);
        expect(stored(current)).toEqual({mode: "dark", radius: "lg"});
        const empty = fakeStorage();
        migrate(empty);
        expect(empty.map.size).toBe(0);
    });
});
