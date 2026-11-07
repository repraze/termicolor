import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

import {describe, expect, it} from "vitest";

/**
 * Raw color math. Ports pick named roles, and derive only through the level helpers
 * (`wash`, `solid`, `tint` with a named LEVEL, DESIGN.md §13), never arbitrary numbers.
 */
const COLOR_MATH = ["flatten", "mix", "alpha", "fromOklch"];

/** Ports allowed to do color math, and why. */
const ALLOWED: Record<string, string[]> = {
    // owned by the wallpapers package, which renders images and blends by design
    wallpapers: COLOR_MATH,
};

const PORTS_DIR = import.meta.dirname;

const ports = readdirSync(PORTS_DIR, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => readdirSync(join(PORTS_DIR, name)).includes("port.ts"));

/** Names imported from @repraze/termicolor by a module's source. */
function paletteImports(source: string): string[] {
    const imports = source.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']@repraze\/termicolor["']/g);
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

    it.each(ports)("%s/port.ts imports no color math from @repraze/termicolor", (port) => {
        const source = readFileSync(join(PORTS_DIR, port, "port.ts"), "utf8");
        const allowed = ALLOWED[port] ?? [];
        const used = paletteImports(source).filter((name) => COLOR_MATH.includes(name) && !allowed.includes(name));
        expect(used, `${port} should use a palette role (e.g. *Solid, tints, dims) instead`).toEqual([]);
    });

    it("parses named, aliased and type-only imports", () => {
        const source = [
            'import {alpha as a, type Hex, mix} from "@repraze/termicolor";',
            'import type {Mode} from "@repraze/termicolor";',
        ].join("\n");
        expect(paletteImports(source)).toEqual(["alpha", "mix"]);
    });
});

describe("level helpers use named levels", () => {
    it.each(ports.filter((p) => p !== "wallpapers"))("%s passes level names, not numbers", (port) => {
        const source = readFileSync(join(PORTS_DIR, port, "port.ts"), "utf8");
        const numeric = [...source.matchAll(/\b(wash|tint)\([^()]*,\s*[\d.]+/g)].map((m) => m[0]);
        expect(numeric).toEqual([]);
    });
});
