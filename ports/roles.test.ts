import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {describe, expect, it} from "vitest";

/** Palette helpers that do color math. Ports pick named roles instead (DESIGN.md §11). */
const COLOR_MATH = ["flatten", "mix", "alpha"];

/** Ports allowed to do color math, and why. */
const ALLOWED: Record<string, string[]> = {
    // owned by the wallpapers package, which renders images and blends by design
    wallpapers: COLOR_MATH,
    // VS Code composites translucent overlays (word and bracket highlights, diff and merge washes,
    // scrollbars, overview ruler) over syntax and selection; the palette has no named role for these
    vscode: ["alpha"],
};

const PORTS_DIR = import.meta.dirname;

const ports = readdirSync(PORTS_DIR, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => readdirSync(join(PORTS_DIR, name)).includes("port.ts"));

/** Names imported from @termicolor/palette by a module's source. */
function paletteImports(source: string): string[] {
    const imports = source.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']@termicolor\/palette["']/g);
    return [...imports].flatMap(([, typeOnly, names = ""]) =>
        typeOnly
            ? []
            : names
                  .split(",")
                  .map((name) => name.trim())
                  .filter((name) => name && !name.startsWith("type "))
                  .map((name) => name.split(/\s+as\s+/)[0]!.trim()),
    );
}

describe("ports pick roles instead of doing color math", () => {
    it("finds the ports", () => {
        expect(ports.length).toBeGreaterThan(10);
    });

    it.each(ports)("%s/port.ts imports no color math from @termicolor/palette", (port) => {
        const source = readFileSync(join(PORTS_DIR, port, "port.ts"), "utf8");
        const allowed = ALLOWED[port] ?? [];
        const used = paletteImports(source).filter((name) => COLOR_MATH.includes(name) && !allowed.includes(name));
        expect(used, `${port} should use a palette role (e.g. *Solid, tints, dims) instead`).toEqual([]);
    });

    it("parses named, aliased and type-only imports", () => {
        const source = [
            'import {alpha as a, type Hex, mix} from "@termicolor/palette";',
            'import type {Mode} from "@termicolor/palette";',
        ].join("\n");
        expect(paletteImports(source)).toEqual(["alpha", "mix"]);
    });
});
