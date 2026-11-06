import {readFileSync} from "node:fs";
import {join} from "node:path";

import {describe, expect, it} from "vitest";

import type {RegistryEntry} from "./registry";
import {buildDocs, createIndex, designRoles, loadIndex, plainText, search} from "./search";
import type {WallpaperCatalog} from "./wallpapers";

const ROOT = join(import.meta.dirname, "../../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const docs = buildDocs({
    registry: JSON.parse(read("ports/registry.json")) as RegistryEntry[],
    catalog: JSON.parse(read("ports/wallpapers/dist/catalog.json")) as WallpaperCatalog,
    design: read("packages/palette/DESIGN.md"),
});
// round-trip through JSON, as the site does
const index = loadIndex(JSON.stringify(createIndex(docs)));
const first = (q: string) => search(index, q)[0];

describe("site search", () => {
    it("has unique ids", () => {
        expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length);
    });

    it("finds ports by name, with typos and prefixes", () => {
        expect(first("kitty")?.to).toBe("/ports/kitty");
        expect(first("alacrity")?.to).toBe("/ports/alacritty");
        expect(first("wez")?.to).toBe("/ports/wezterm");
    });

    it("finds ports by what they contain: install steps, file names, tags", () => {
        expect(search(index, "gsettings").map((h) => h.to)).toContain("/ports/gnome-terminal");
        expect(search(index, "FZF_DEFAULT_OPTS").map((h) => h.to)).toContain("/ports/fzf");
    });

    it("sends planned ports to the filtered list", () => {
        const hit = search(index, "windows theme pack").find((h) => h.planned);
        expect(hit).toMatchObject({to: "/ports", search: {status: "planned"}});
    });

    it("finds palette roles from DESIGN.md and modes with anchors", () => {
        expect(first("accentTint")?.summary).toMatch(/menu item/);
        expect(search(index, "high contrast").some((h) => h.hash === "dark-hc")).toBe(true);
    });

    it("finds wallpaper families", () => {
        expect(search(index, "gradients wallpapers")[0]).toMatchObject({
            to: "/ports/wallpapers",
            search: {family: "gradients"},
        });
    });

    it("parses role tables and markdown", () => {
        expect(designRoles("| `a` / `b` | use **it** |\n| x | y |")).toEqual(
            new Map([
                ["a", "use it"],
                ["b", "use it"],
            ]),
        );
        expect(plainText("Run `kitten themes`:\n```sh\nfoo\n```")).toBe("Run kitten themes : foo");
    });
});
