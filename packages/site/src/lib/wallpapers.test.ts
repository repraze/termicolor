import {readFileSync} from "node:fs";
import {fileURLToPath, URL} from "node:url";

import {describe, expect, it} from "vitest";

import {
    countByFamily,
    filesFor,
    filterWallpapers,
    parseFile,
    sizeLabel,
    thumbPath,
    type WallpaperCatalog,
    type WallpaperEntry,
} from "./wallpapers";

const entry = (id: string, family: string, files: string[]): WallpaperEntry => ({
    id,
    generator: id.split("-")[0]!,
    name: id,
    family,
    seed: 1,
    params: {},
    files,
});

const ALL_SIZES = ["1920x1080", "2560x1440", "3840x2160", "1080x1920", "1440x2560", "2160x3840"];
const full = (id: string, family: string) =>
    entry(
        id,
        family,
        ["dark", "light"].flatMap((mode) => ALL_SIZES.map((size) => `${mode}/${size}/${id}.svg`)),
    );

describe("parseFile", () => {
    it("reads mode, size, orientation and label", () => {
        expect(parseFile("light/1440x2560/flow-2.svg")).toEqual({
            path: "light/1440x2560/flow-2.svg",
            mode: "light",
            width: 1440,
            height: 2560,
            orientation: "portrait",
            label: "QHD",
        });
        expect(parseFile("dark/3840x2160/flow-2.svg")?.orientation).toBe("landscape");
    });

    it("ignores anything else", () => {
        expect(parseFile("catalog.json")).toBeUndefined();
        expect(parseFile("dark/flow-2.svg")).toBeUndefined();
        expect(parseFile("dim/1920x1080/flow-2.svg")).toBeUndefined();
    });
});

describe("sizeLabel", () => {
    it("names sizes by the short side", () => {
        expect(sizeLabel({width: 1920, height: 1080})).toBe("1080p");
        expect(sizeLabel({width: 1080, height: 1920})).toBe("1080p");
        expect(sizeLabel({width: 2560, height: 1440})).toBe("QHD");
        expect(sizeLabel({width: 2160, height: 3840})).toBe("4K");
        expect(sizeLabel({width: 3440, height: 1200})).toBe("3440x1200");
    });
});

describe("filesFor", () => {
    it("picks one mode and orientation, smallest first", () => {
        const e = entry("mesh-1", "gradients", [
            "dark/3840x2160/mesh-1.svg",
            "dark/1080x1920/mesh-1.svg",
            "dark/1920x1080/mesh-1.svg",
            "light/1920x1080/mesh-1.svg",
            "dark/2560x1440/mesh-1.svg",
        ]);
        expect(filesFor(e, "dark", "landscape").map((f) => f.label)).toEqual(["1080p", "QHD", "4K"]);
        expect(filesFor(e, "dark", "portrait").map((f) => f.path)).toEqual(["dark/1080x1920/mesh-1.svg"]);
        expect(filesFor(e, "light", "portrait")).toEqual([]);
    });
});

describe("filterWallpapers", () => {
    const entries = [full("mesh-1", "gradients"), full("flow-2", "lines"), entry("grid-1", "patterns", [])];

    it("filters by family and drops entries without files for the view", () => {
        const ids = (family?: string) =>
            filterWallpapers(entries, {family, mode: "dark", orientation: "portrait"}).map((e) => e.id);
        expect(ids()).toEqual(["mesh-1", "flow-2"]);
        expect(ids("lines")).toEqual(["flow-2"]);
        expect(ids("patterns")).toEqual([]);
    });
});

describe("thumbPath", () => {
    it("nests by mode and orientation", () => {
        expect(thumbPath("flow-2", "light", "portrait")).toBe("thumbs/light/portrait/flow-2.webp");
    });
});

describe("the generated catalog", () => {
    const catalog = JSON.parse(
        readFileSync(fileURLToPath(new URL("../../../../ports/wallpapers/dist/catalog.json", import.meta.url)), "utf8"),
    ) as WallpaperCatalog;

    it("has three sizes per mode and orientation for every wallpaper", () => {
        for (const e of catalog.wallpapers) {
            for (const mode of ["dark", "light"] as const) {
                for (const orientation of ["landscape", "portrait"] as const) {
                    expect(filesFor(e, mode, orientation).map((f) => f.label)).toEqual(["1080p", "QHD", "4K"]);
                }
            }
        }
    });

    it("only uses known families", () => {
        const counts = countByFamily(catalog);
        expect(counts.map((c) => c.family)).toEqual(["gradients", "lines", "patterns"]);
        expect(counts.reduce((n, c) => n + c.count, 0)).toBe(catalog.wallpapers.length);
    });
});
