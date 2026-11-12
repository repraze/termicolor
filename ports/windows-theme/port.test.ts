import {ACCENTS, createPalette} from "@repraze/termicolor";
import {CATALOG, describeEntry} from "@termicolor/wallpapers";
import {describe, expect, it} from "vitest";

import port, {FEATURED, featuredFile} from "./port.ts";

describe("windows-theme", () => {
    it.each(ACCENTS)("features a catalog wallpaper led by %s", (accent) => {
        const entry = CATALOG.find((e) => e.id === FEATURED[accent]);
        expect(entry, FEATURED[accent]).toBeDefined();
        expect(describeEntry(entry!).lead).toBe(accent);
    });

    it("builds both modes with the accent fill and the matching system mode", () => {
        const palette = createPalette({accent: "pink"});
        const files = port.build(palette);
        expect(files.map((f) => f.path)).toEqual(["Termicolor Dark.theme", "Termicolor Light.theme", "install.ps1"]);
        for (const [file, mode] of [
            [files[0]!, palette.modes.dark],
            [files[1]!, palette.modes.light],
        ] as const) {
            const name = mode.type === "dark" ? "Dark" : "Light";
            expect(file.contents).toContain(
                `ColorizationColor=0XC4${mode.roles.accentFill.slice(1).toUpperCase()}\r\n`,
            );
            expect(file.contents).toContain(`SystemMode=${name}\r\nAppMode=${name}\r\n`);
            expect(file.contents).toContain(`Themes\\Termicolor\\${name}\\${featuredFile("pink", mode.type)}\r\n`);
            expect(file.contents).toContain("[MasterThemeSelector]\r\nMTSM=RJSPBS\r\n");
            expect(file.contents).not.toMatch(/[^\r]\n/);
        }
    });
});
